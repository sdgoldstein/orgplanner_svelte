import {type Service} from "@sphyrna/service-manager-ts";

export const SERIALIZATION_SERVICE_NAME: string = "SERIALIZATION_SERVICE_NAME";

enum SerializationFormat {
    JSON = "JSON",
    FAKE = "FAKE",
    AVRO = "AVRO"
}

type SerializedTypeForSerializableFormat<T extends SerializationFormat> =
    T extends SerializationFormat.JSON ? string : T extends SerializationFormat.FAKE
                                                                ? string
                                                                : T extends SerializationFormat.AVRO ? Uint8Array
                                                                                                     : string;

interface SerializableDescriptor
{
    name: string;
    objectVersion: number;
}

function RegisterSerializable(name: string, objectVersion: number)
{
    return function(target: Function) {
        target.prototype.getSerializableDescriptor = () => { return {name : name, objectVersion : objectVersion}; };
    };
}

interface Serializable
{
    getSerializableDescriptor(): SerializableDescriptor;
}

interface Serializer<T, F extends SerializationFormat>
{
    serialize(serializableObject: any,
              serializationHelper: SerializationHelper<F>): SerializedTypeForSerializableFormat<F>;
    deserialize(data: string, serializationHelper: SerializationHelper<F>): T;
}

interface SerializationHelper<F extends SerializationFormat>
{
    depth: number;
    serialize(serializableObject: any): SerializedTypeForSerializableFormat<F>;
    deserialize<T>(data: SerializedTypeForSerializableFormat<F>): T;
}

interface SerializationService extends Service
{
    serialize(serializableObject: any, format: SerializationFormat.JSON): string;
    serialize(serializableObject: any, format: SerializationFormat.FAKE): string;
    serialize(serializableObject: any, format: SerializationFormat.AVRO): Uint8Array;
    serialize(serializableObject: any, format: SerializationFormat): string|Uint8Array;

    deserialize<T>(data: string, format: SerializationFormat.JSON): T;
    deserialize<T>(data: string, format: SerializationFormat.FAKE): T;
    deserialize<T>(data: Uint8Array, format: SerializationFormat.AVRO): T;
    deserialize<T>(data: string|Uint8Array, format: SerializationFormat): T;
}

export type{
    SerializationService,
    Serializer,
    SerializableDescriptor,
    SerializationHelper,
    Serializable,
    SerializedTypeForSerializableFormat
};
export {SerializationFormat, RegisterSerializable};
