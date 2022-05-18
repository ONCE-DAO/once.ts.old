import Server, { ServerStatusType } from "../../3_services/Server.interface";

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";
import { z } from "zod";
import DefaultUcpModel, { UcpModelProxyIORSchema, UcpModelProxySchema } from "../Things/DefaultUcpModel.class";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUrl from "../Things/DefaultUrl.class";
import fs from "fs";

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


        let onceBaseDir = process.cwd();

        let baseDirectory = await ONCE.eamd?.eamdDirectory;
        if (!baseDirectory) throw new Error("Missing Base Directory");


        this._fastify.use('/', serveStatic(baseDirectory));

        this._fastify.use('/EAMD.ucp', serveStatic(baseDirectory));
        this._fastify.use('/EAMD.ucp/tla/EAM/once.ts', serveStatic(onceBaseDir));

        this._fastify.get('/*', async (request: FastifyRequest, reply: FastifyReply) => {
            let url = request.url;
            if (url.match('EAMD.ucp/tla/EAM/once.ts') && (url.endsWith('.class') || url.endsWith('.interface'))) {
                let matchResult = url.match(/EAMD.ucp\/tla\/EAM\/once.ts\/(.*)/);
                if (matchResult) {
                    let file = path.join(onceBaseDir, matchResult[1] + '.js');
                    if (fs.existsSync(file)) {
                        reply.header('Content-Type', 'application/javascript; charset=UTF-8');
                        return fs.readFileSync(file, 'utf8');
                    }

                }
            }
            throw new Error("Not Found");

        })






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