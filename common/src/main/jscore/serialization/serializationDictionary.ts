import {type Service, BaseService} from "@sphyrna/service-manager-ts";

import {type SerializableDescriptor, SerializationFormat, type Serializer} from "./serializationService";

export const SERIALIZATION_DICTIONARY_SERVICE_NAME: string = "SERIALIZATION_DICTIONARY_SERVICE_NAME";

interface SerializerDictionaryService extends Service
{
    registerSerializer(name: string, format: SerializationFormat, serializer: Serializer<typeof format>): void;
    getSerializer(serializationDescriptor: SerializableDescriptor,
                  format: SerializationFormat): Serializer<typeof format>;
}

const REGISTERED_SERIALIZERS = new Map();
REGISTERED_SERIALIZERS.set("JSON", new Map());

function RegisterSerializer(name: string, format: SerializationFormat)
{
    return function<T extends {new (...args: any[]) : Serializer<typeof format>}>(target: T)
    {
        const serializersForFormat: Map<string, Serializer<typeof format>>|undefined =
            REGISTERED_SERIALIZERS.get(format);
        if (serializersForFormat === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, not found.`);
        }

        serializersForFormat.set(name, new target());
    };
}
class SerializerDictionaryServiceImpl extends BaseService implements SerializerDictionaryService
{

    readonly serializers: Map<SerializationFormat, Map<string, Serializer<SerializationFormat>>> = new Map();

    constructor()
    {
        super();

        // Should I deep clone instead?
        this.serializers = REGISTERED_SERIALIZERS;
    }

    registerSerializer(name: string, format: SerializationFormat, serializer: Serializer<typeof format>): void
    {
        const serializersForFormat: Map<string, Serializer<typeof format>>|undefined = this.serializers.get(format);
        if (serializersForFormat === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, not found.`);
        }

        serializersForFormat.set(name, serializer);
    }

    getSerializer(serializationDescriptor: SerializableDescriptor,
                  format: SerializationFormat): Serializer<typeof format>
    {
        const dictionaryForFormat = this.serializers.get(format);
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
        return serializerToReturn;
    }
}

export type{SerializerDictionaryService};
export {SerializerDictionaryServiceImpl, RegisterSerializer}