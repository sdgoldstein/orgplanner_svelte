import {BaseService, ServiceManager, type Service} from "@sphyrna/service-manager-ts";
import {
    BaseIndividualContributor,
    BaseIndividualContributorSerializer,
    BaseManager,
    BaseManagerSerializer,
    BaseTeam,
    BaseTeamSerializer,
    OrgDataCoreDefaultImpl,
    OrgDataCoreDefaultImplSerializer,
    TreeBasedOrgStructure,
    TreeBasedOrgStructureSerializer
} from "@src/model";

export const SERIALIZATION_SERVICE_NAME: string = "SERIALIZATION_SERVICE_NAME";
export const SERIALIZATION_DICTIONARY_SERVICE_NAME: string = "SERIALIZATION_DICTIONARY_SERVICE_NAME";

enum SerializationFormat {
    JSON = "JSON",
    FAKE = "FAKE",
    AVRO = "AVRO"
}

type ReturnTypeForSerializableFormat<T extends SerializationFormat> =
    T extends SerializationFormat.JSON ? string : T extends SerializationFormat.FAKE
                                                                ? string
                                                                : T extends SerializationFormat.AVRO ? Uint8Array
                                                                                                     : string;

interface SerializableDescriptor<T>
{
    name: string;
    objectVersion: number;
}

interface Serializable
{
}

interface StaticSerializable<T>
{
    new(...args: any[]): any
    SERIALIZATION_DESCRIPTOR: SerializableDescriptor<T>;
}

interface Serializer<T extends Serializable, F extends SerializationFormat>
{
    serialize(serializableObject: T, serializationHelper: SerializationHelper<F>): ReturnTypeForSerializableFormat<F>;
    deserialize(data: string, serializationHelper: SerializationHelper<F>): T;
}

interface RootSerializer<F extends SerializationFormat>
{
    serialize<T extends Serializable>(serializableObject: T): ReturnTypeForSerializableFormat<F>;
    deserialize<T extends Serializable>(data: string): T;
}

interface SerializationHelper<F extends SerializationFormat>
{
    depth: number;
    serialize<T extends Serializable>(serializableObject: T): ReturnTypeForSerializableFormat<F>;
    deserialize<T extends Serializable>(data: string): T;
}

abstract class BaseRootSerializer<F extends SerializationFormat> implements RootSerializer<F>
{
    serialize<T extends Serializable>(serializableObject: T): ReturnTypeForSerializableFormat<F>
    {
        return this.createHelper().serialize(serializableObject);
    }
    deserialize<T extends Serializable>(data: string): T
    {
        throw new Error("Method not implemented.");
    }

    abstract createHelper(): SerializationHelper<F>;
}

class SerializationHelperDefault<F extends SerializationFormat> implements SerializationHelper<F>
{
    depth: number = 0;

    constructor(private serializationFormat: F) {}
    serialize<T extends Serializable>(serializableObject: T): ReturnTypeForSerializableFormat<F>
    {
        this.depth++;

        // This is ugly.  Accessing the static descriptor by type casting the object to serialize as a
        // StaticSerializable
        const serializationDescriptor: SerializableDescriptor<T> =
            (serializableObject.constructor as StaticSerializable<T>).SERIALIZATION_DESCRIPTOR;

        if (serializationDescriptor === undefined)
        {
            throw new Error(`Failed to retrieve serialization descriptor for object`)
        }

        const dictionaryService: SerializerDictionaryService =
            ServiceManager.getService(SERIALIZATION_DICTIONARY_SERVICE_NAME);

        const serializer: Serializer<typeof serializableObject, F> =
            dictionaryService.getSerializer(serializationDescriptor, this.serializationFormat);

        const valueToReturn = serializer.serialize(serializableObject, this);

        this.depth--;

        return valueToReturn;
    }

    deserialize<T extends Serializable>(data: string): T
    {
        throw new Error("Method not implemented.");
    }
}

interface SerializationService extends Service
{
    serialize(serializableObject: Serializable, format: SerializationFormat.JSON): string;
    serialize(serializableObject: Serializable, format: SerializationFormat.FAKE): string;
    serialize(serializableObject: Serializable, format: SerializationFormat.AVRO): Uint8Array;
    serialize(serializableObject: Serializable, format: SerializationFormat): string|Uint8Array;

    deserialize<T>(data: string, format: SerializationFormat.JSON,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: string, format: SerializationFormat.FAKE,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: Uint8Array, format: SerializationFormat.AVRO,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: string|Uint8Array, format: SerializationFormat,
                   serializableDescriptor: SerializableDescriptor<T>): T;
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

interface SerializerDictionaryService extends Service
{
    getSerializer<T extends Serializable>(serializationDescriptor: SerializableDescriptor<T>,
                                          format: SerializationFormat): Serializer<T, typeof format>;
    getSerializer<T extends Serializable>(serializationDescriptor: SerializableDescriptor<T>,
                                          format: SerializationFormat,
                                          serializerVersion: number): Serializer<T, typeof format>;
}

class SerializerDictionaryServiceImpl extends BaseService implements SerializerDictionaryService
{
    getSerializer<T extends Serializable>(serializationDescriptor: SerializableDescriptor<T>,
                                          format: SerializationFormat): Serializer<T, typeof format>;
    getSerializer<T extends Serializable>(serializationDescriptor: SerializableDescriptor<T>,
                                          format: SerializationFormat,
                                          serializerVersion: number): Serializer<T, typeof format>;
    getSerializer<T extends Serializable>(serializationDescriptor: SerializableDescriptor<T>,
                                          format: SerializationFormat,
                                          serializerVersion?: number): Serializer<T, typeof format>
    {
        const dictionaryForFormat = SerializerDictionaryServiceImpl.SERIALIZERS.get(format);
        if (dictionaryForFormat === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, not found.`);
        }

        const serializerToReturn = dictionaryForFormat.get(serializationDescriptor.name);
        if (serializerToReturn === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, and serialization name, ${
                serializationDescriptor.name}, not found.`);
        }

        // This is ugly, but don't know another way, as we're narrowing the generic here from T to a specific type of
        // Serializable
        return serializerToReturn as unknown as Serializer<T, typeof format>;
    }

    static readonly SERIALIZERS = new Map();
    static
    {
        const jsonSerializerMap = new Map();
        jsonSerializerMap.set(OrgDataCoreDefaultImpl.SERIALIZATION_DESCRIPTOR.name,
                              new OrgDataCoreDefaultImplSerializer());
        jsonSerializerMap.set(TreeBasedOrgStructure.SERIALIZATION_DESCRIPTOR.name,
                              new TreeBasedOrgStructureSerializer());
        jsonSerializerMap.set(BaseManager.SERIALIZATION_DESCRIPTOR.name, new BaseManagerSerializer());
        jsonSerializerMap.set(BaseIndividualContributor.SERIALIZATION_DESCRIPTOR.name,
                              new BaseIndividualContributorSerializer());
        jsonSerializerMap.set(BaseTeam.SERIALIZATION_DESCRIPTOR.name, new BaseTeamSerializer());

        this.SERIALIZERS.set(SerializationFormat.JSON, jsonSerializerMap);
    }
}

class SerializationServiceImpl extends BaseService implements SerializationService
{
    static readonly ROOT_SERIALIZERS: Map<SerializationFormat, RootSerializer<SerializationFormat>> =
        new Map([ [ SerializationFormat.JSON, new RootJSONSerializer() ] ]);

    serialize(serializableObject: Serializable, format: SerializationFormat.JSON): string;
    serialize(serializableObject: Serializable, format: SerializationFormat.FAKE): string;
    serialize(serializableObject: Serializable, format: SerializationFormat.AVRO): Uint8Array;
    serialize(serializableObject: Serializable, format: SerializationFormat): string|Uint8Array
    {
        const rootSerializer: RootSerializer<typeof format>|undefined =
            SerializationServiceImpl.ROOT_SERIALIZERS.get(format);
        if (!rootSerializer)
        {
            throw new Error(`Could not find root serializer for ${format}`);
        }

        return rootSerializer.serialize(serializableObject);
    }

    deserialize<T>(data: string, format: SerializationFormat.JSON,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: string, format: SerializationFormat.FAKE,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: Uint8Array, format: SerializationFormat.AVRO,
                   serializableDescriptor: SerializableDescriptor<T>): T;
    deserialize<T>(data: string|Uint8Array, format: SerializationFormat,
                   serializableDescriptor: SerializableDescriptor<T>): T
    {

        throw new Error("Method not implemented.");
    }
}

export
type{SerializationService, Serializer, SerializableDescriptor, Serializable, StaticSerializable, SerializationHelper};
export {
    SerializationServiceImpl,
    SerializationFormat,
    BaseRootSerializer,
    SerializationHelperDefault,
    SerializerDictionaryServiceImpl
}
