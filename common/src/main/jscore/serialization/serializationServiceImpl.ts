import {BaseService} from "@sphyrna/service-manager-ts";
import {
    SerializationFormat,
    type SerializationService,
    type SerializedTypeForSerializableFormat
} from "./serializationService";
import {RootJSONSerializer} from "./jsonSerializer";
import type {RootSerializer} from "./rootSerializer";

// FIXME - Would like this is jsonSerializer.ts, but it creates a circular dependency with this file.  Need to reorg
// files

/******* */

class SerializationServiceImpl extends BaseService implements SerializationService
{
    static readonly ROOT_SERIALIZERS: Map<SerializationFormat, RootSerializer<SerializationFormat>> =
        new Map([ [ SerializationFormat.JSON, new RootJSONSerializer() ] ]);

    deserialize<T>(data: string, format: SerializationFormat.JSON): T;
    deserialize<T>(data: string, format: SerializationFormat.FAKE): T;
    deserialize<T>(data: Uint8Array, format: SerializationFormat.AVRO): T;
    deserialize<T>(data: string|Uint8Array, format: SerializationFormat): T;
    deserialize<T>(data: SerializedTypeForSerializableFormat<typeof format>, format: SerializationFormat): T
    {
        const rootSerializer: RootSerializer<typeof format>|undefined =
            SerializationServiceImpl.ROOT_SERIALIZERS.get(format);
        if (!rootSerializer)
        {
            throw new Error(`Could not find root serializer for ${format}`);
        }

        return rootSerializer.deserialize(data);
    }

    serialize(serializableObject: any, format: SerializationFormat.JSON): string;
    serialize(serializableObject: any, format: SerializationFormat.FAKE): string;
    serialize(serializableObject: any, format: SerializationFormat.AVRO): Uint8Array;
    serialize(serializableObject: any, format: SerializationFormat): string|Uint8Array
    {
        const rootSerializer: RootSerializer<typeof format>|undefined =
            SerializationServiceImpl.ROOT_SERIALIZERS.get(format);
        if (!rootSerializer)
        {
            throw new Error(`Could not find root serializer for ${format}`);
        }

        return rootSerializer.serialize(serializableObject);
    }
}

export {SerializationServiceImpl};