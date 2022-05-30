import Server, { ServerStatusType } from "../../3_services/Server.interface";

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";
import DefaultUcpModel, { UcpModelProxyIORSchema, UcpModelProxySchema } from "../Things/DefaultUcpModel.class";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUrl from "../Things/DefaultUrl.class";
import fs from "fs";

import path from 'path';

import middie from 'middie';

import serveStatic from 'serve-static';
import { z } from "../Zod";
import DefaultIOR from "../Things/DefaultIOR.class";
import { loaderReturnValue } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";
import UcpComponent from "../../3_services/UcpComponent.interface";
import UDELoader from "../Things/UDELoader.class";


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


        this._fastify.get('/UDE/*', this._handleUDE_CRUD)
        this._fastify.put('/UDE/*', this._handleUDE_CRUD)
        this._fastify.post('/UDE/*', this._handleUDE_CRUD)
        this._fastify.post('/UDE', this._handleUDE_CRUD)
        this._fastify.delete('/UDE/*', this._handleUDE_CRUD)



        this._fastify.get('/ior*', async (request: FastifyRequest, reply: FastifyReply) => {
            let url = request.url;
            if (url.startsWith('/ior:esm:')) {
                if (request.headers['sec-fetch-dest'] === 'script') {
                    // This all is a resolver!
                    const ior = new DefaultIOR().init(url.replace(/^\//, ''))
                    let urlPath: string = await ior.load({ returnValue: loaderReturnValue.path });

                    ONCE.eamd?.eamdDirectory
                    // HACK as once is not in EAMD.ucp!
                    if (urlPath.endsWith('/once.ts/src') && !urlPath.match(/EAMD\.ucp/)) {
                        urlPath = 'EAMD.ucp/tla/EAM/once.ts/src';
                    } else {
                        urlPath = path.relative(path.join(ONCE.eamd?.eamdDirectory as string, '..'), urlPath)

                    }
                    reply.redirect('/' + urlPath + '/');
                }
            }
            throw new Error("Not Found");

        })


        this._fastify.get('/*', async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.headers['sec-fetch-dest'] === 'script') {
                let url = request.url;
                if (url.match('EAMD.ucp/tla/EAM/once.ts')) {
                    let matchResult = url.match(/EAMD.ucp\/tla\/EAM\/once.ts\/(.*)/);
                    if (matchResult) {
                        if ((url.endsWith('.class') || url.endsWith('.interface'))) {
                            let file = path.join(onceBaseDir, matchResult[1] + '.js');
                            if (fs.existsSync(file)) {
                                reply.header('Content-Type', 'application/javascript; charset=UTF-8');
                                return fs.readFileSync(file, 'utf8');
                            }

                        }
                        let files: string[] = ['index.mjs', 'index.js'];
                        for (let fileName of files) {
                            let file = path.join(onceBaseDir, matchResult[1] + fileName);
                            if (fs.existsSync(file)) {
                                reply.header('Content-Type', 'application/javascript; charset=UTF-8');
                                return fs.readFileSync(file, 'utf8');
                            }
                        }
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

    // TODO@BE Need rework
    private async _handleUDE_CRUD(request: FastifyRequest, reply: FastifyReply) {
        let url = request.url;
        reply.header('Content-Type', 'application/json; charset=utf-8');

        if (request.method === 'GET') {

            const ior = new DefaultIOR().init(url);
            ior.protocol.push(urlProtocol.ude);
            let udeComponent = await ior.load() as UcpComponent<any, any>;

            //Hack works for now, but should be changed
            //@ts-ignore
            return udeComponent.persistanceManager.list[0].ucpComponentData;

        } else if (request.method === 'POST') {
            let udeData = UDELoader.validateUDEStructure(request.body);
            let udeComponentClass = await DefaultIOR.load(udeData.typeIOR);
            let udeComponent = new udeComponentClass() as UcpComponent<any, any>;

            udeComponent.model = udeData.particle.data;
            udeComponent.IOR.id = udeData.id;

            let persistanceManagerHandler = udeComponent.persistanceManager;
            if (udeData.alias !== undefined) {
                for (let alias of udeData.alias) {
                    persistanceManagerHandler.addAlias(alias);
                }
            }

            await udeComponent.persistanceManager.create();

            //Hack works for now, but should be changed
            //@ts-ignore
            return udeComponent.persistanceManager.list[0].ucpComponentData;
        } else if (request.method === 'DELETE') {
            const ior = new DefaultIOR().init(url);
            ior.protocol.push(urlProtocol.ude);
            let udeComponent = await ior.load() as UcpComponent<any, any>;

            await udeComponent.persistanceManager.delete();
            return { delete: 'ok' }

        } else if (request.method === 'PUT') {
            let udeData = UDELoader.validateUDEStructure(request.body);

            const ior = new DefaultIOR().init(url);
            ior.protocol.push(urlProtocol.ude);
            let udeComponent = await ior.load() as UcpComponent<any, any>;
            udeComponent.model = udeData.particle.data;



            //Hack works for now, but should be changed
            //@ts-ignore
            return udeComponent.persistanceManager.list[0].ucpComponentData;
        }

        throw new Error("Method not implemented")
    }

    async stop(): Promise<any> {
        if (this._fastify !== undefined) {
            await this._fastify.close();
            this._fastify = undefined;
        }
    }


}