// import { z } from "zod";

// export { z };
// import IOR from "../../3_services/IOR.interface";
// import DefaultIOR from "../Things/DefaultIOR.class";





// type RawCreateParams =
//     | {
//         errorMap?: z.ZodErrorMap;
//         invalid_type_error?: string;
//         required_error?: string;
//         description?: string;
//     }
//     | undefined;

// type ProcessedCreateParams = { errorMap?: z.ZodErrorMap; description?: string };
// function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
//     if (!params) return {};
//     const { errorMap, invalid_type_error, required_error, description } = params;
//     if (errorMap && (invalid_type_error || required_error)) {
//         throw new Error(
//             `Can't use "invalid" or "required" in conjunction with custom error map.`
//         );
//     }
//     if (errorMap) return { errorMap: errorMap, description };
//     const customMap: z.ZodErrorMap = (iss, ctx) => {
//         if (iss.code !== "invalid_type") return { message: ctx.defaultError };
//         if (typeof ctx.data === "undefined" && required_error)
//             return { message: required_error };
//         if (params.invalid_type_error)
//             return { message: params.invalid_type_error };
//         return { message: ctx.defaultError };
//     };
//     return { errorMap: customMap, description };
// }

// export interface OnceZodIorDef<T extends z.ZodRawShape = z.ZodRawShape> extends z.ZodTypeDef {
//     typeName: 'OnceZodIOR';
//     iorType: string | undefined
// }

// type superIORObject = IOR | { IOR: IOR }

// class OnceZodIor extends z.ZodType<superIORObject, OnceZodIorDef, superIORObject>{
//     _parse(input: z.ParseInput): z.ParseReturnType<this["_output"]> {
//         const { status, ctx } = this._processInputParams(input);

//         const data = input.data;
//         //TODO@BE Replace with runtime interface
//         if (data instanceof DefaultIOR) {
//             return { status: "valid", value: data }
//         } else if (typeof data === "string") {
//             if (data.startsWith("ior:")) {
//                 return { status: "valid", value: new DefaultIOR().init(data) }
//             } else {
//                 z.addIssueToContext(
//                     ctx,
//                     {
//                         path: input.path,
//                         code: z.ZodIssueCode.custom,
//                         message: "Not a IOR String",
//                     }
//                 );
//                 return z.INVALID;
//             }

//             //TODO@BE Replace with runtime interface
//         } else if (typeof data === "object" && "IOR" in data && data.IOR instanceof DefaultIOR) {
//             return { status: "valid", value: data }
//         } else {
//             z.addIssueToContext(
//                 ctx,
//                 {
//                     path: input.path,
//                     code: z.ZodIssueCode.custom,
//                     message: "Not an IOR Type",
//                 }
//             );
//             return z.INVALID;
//         }


//     }

//     optional(): z.ZodOptional<this> {
//         return z.ZodOptional.create(this) as any;
//     }

//     static create = <T extends z.ZodRawShape>(iorType?: string, params?: RawCreateParams): OnceZodIor => {
//         return new OnceZodIor({
//             iorType,
//             typeName: 'OnceZodIOR',
//             ...processCreateParams(params),
//         });
//     }
// }


// const iorType = OnceZodIor.create;


// const oz = { ior: iorType, OnceZodIor };

// export { oz, z };
