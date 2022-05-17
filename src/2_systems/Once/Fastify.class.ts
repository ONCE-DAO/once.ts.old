import Server, { ServerStatusType } from "../../3_services/Server.interface";

import Fastify, { FastifyInstance } from 'fastify';
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";
import { z } from "zod";
import DefaultUcpModel, { UcpModelProxyIORSchema, UcpModelProxySchema } from "../Things/DefaultUcpModel.class";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUrl from "../Things/DefaultUrl.class";

import path from 'path';

import middie from 'middie';

import serveStatic from 'serve-static';


const modelSchema =
    z.object({
        port: z.number(),

    })
        .merge(BaseUcpComponent.modelSchema).merge(UcpModelProxySchema)
    ;

type ModelDataType = z.infer<typeof modelSchema>

export default class OnceWebserver extends BaseUcpComponent<ModelDataType, Server> implements Server {
    public readonly ucpModel: UcpModel = new DefaultUcpModel<ModelDataType, Server>(OnceWebserver.modelDefaultData, this);
    private _fastify: FastifyInstance | undefined;


    static get modelSchema() {
        return modelSchema;
    }

    static get modelDefaultData() {
        return {
            ...super.modelDefaultData,
            port: 3000
        }
    }

    get status(): ServerStatusType {
        if (this._fastify === undefined) {
            return "stopped";
        } else {
            return "running";
        }

    }

    get internalUrl() {
        return new DefaultUrl().init(`http://localhost:${this.model.port}`)
    }


    async start(options?: any): Promise<any> {



        if (this._fastify !== undefined) {
            console.warn("Server is already running");
            return;
        }

        this._fastify = Fastify({
            logger: true
        })

        await this._fastify.register(middie);


        this._fastify.get('/', async (request, reply) => {
            reply.type('application/json').code(200)
            return { hello: 'world' }
        })

        let baseDirectory = await ONCE.eamd?.eamdDirectory;
        if (!baseDirectory) throw new Error("Missing Base Directory");

        this._fastify.use('/EAMD.ucp/tla/EAM/once.ts/', serveStatic(baseDirectory));


        this._fastify.listen({ port: this.model.port }, (err, address) => {
            if (err) throw err
            // Server is now listening on ${address}
        })

    }
    async stop(): Promise<any> {
        if (this._fastify !== undefined) {
            await this._fastify.close();
            this._fastify = undefined;
        }
    }


}