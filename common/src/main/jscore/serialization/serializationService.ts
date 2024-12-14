import {BaseService, ServiceManager, type Service} from "@sphyrna/service-manager-ts";
import {SERIALIZATION_DICTIONARY_SERVICE_NAME, type SerializerDictionaryService} from "./serializationDictionary";

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

interface Serializer<F extends SerializationFormat>
{
    serialize(serializableObject: any,
              serializationHelper: SerializationHelper<F>): SerializedTypeForSerializableFormat<F>;
    deserialize<T>(data: string, serializationHelper: SerializationHelper<F>): T;
}

interface RootSerializer<F extends SerializationFormat>
{
    serialize(serializableObject: any): SerializedTypeForSerializableFormat<F>;
    deserialize<T>(data: SerializedTypeForSerializableFormat<F>): T;
}

interface SerializationHelper<F extends SerializationFormat>
{
    depth: number;
    serialize(serializableObject: any): SerializedTypeForSerializableFormat<F>;
    deserialize<T>(data: SerializedTypeForSerializableFormat<F>): T;
}

abstract class BaseRootSerializer<F extends SerializationFormat> implements RootSerializer<F>
{
    serialize<T extends Serializable>(serializableObject: T): SerializedTypeForSerializableFormat<F>
    {
        return this.createHelper().serialize(serializableObject);
    }
    deserialize<T>(data: SerializedTypeForSerializableFormat<F>): T
    {
        return this.createHelper().deserialize(data);
    }

    abstract createHelper(): SerializationHelper<F>;
}

class SerializationHelperDefault<F extends SerializationFormat> implements SerializationHelper<F>
{
    depth: number = 0;

    constructor(private serializationFormat: F) {}
    serialize<T extends Serializable>(serializableObject: T): SerializedTypeForSerializableFormat<F>
    {
        this.depth++;

        // This is ugly.  Accessing the static descriptor by type casting the object to serialize as a
        // StaticSerializable
        const serializationDescriptor: SerializableDescriptor =
            (serializableObject as Serializable).getSerializableDescriptor();

        if (serializationDescriptor === undefined)
        {
            throw new Error(`Failed to retrieve serialization descriptor for object`)
        }

        const dictionaryService: SerializerDictionaryService =
            ServiceManager.getService(SERIALIZATION_DICTIONARY_SERVICE_NAME);

        const serializer: Serializer<F> =
            dictionaryService.getSerializer(serializationDescriptor, this.serializationFormat);

        const valueToReturn = serializer.serialize(serializableObject, this);

        this.depth--;

        return valueToReturn;
    }

    deserialize<T>(data: SerializedTypeForSerializableFormat<F>): T
    {
        throw new Error("Method not implemented.");
    }
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

class JSONSerializationHelper extends SerializationHelperDefault<SerializationFormat.JSON> implements
    SerializationHelper<SerializationFormat.JSON>
{
    constructor()
    {
        super(SerializationFormat.JSON);
    }
}

// FIXME - Would like this is jsonSerializer.ts, but it creates a circular dependency with this file.  Need to reorg
// files
class RootJSONSerializer extends BaseRootSerializer<SerializationFormat.JSON>
{
    createHelper(): SerializationHelper<SerializationFormat.JSON>
    {
        return new JSONSerializationHelper();
    }
}

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

export type{SerializationService, Serializer, SerializableDescriptor, SerializationHelper};
export {
    SerializationServiceImpl,
    SerializationFormat,
    BaseRootSerializer,
    SerializationHelperDefault,
    RegisterSerializable
}
