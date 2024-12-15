import {type SerializableDescriptor, SerializationFormat, type Serializer} from "./serializationService";

export const SERIALIZATION_DICTIONARY_SERVICE_NAME: string = "SERIALIZATION_DICTIONARY_SERVICE_NAME";

interface SerializerDictionaryService
{
    registerSerializer<T>(name: string, format: SerializationFormat, serializer: Serializer<T, typeof format>): void;
    getSerializer<T>(serializationDescriptor: SerializableDescriptor,
                     format: SerializationFormat): Serializer<T, typeof format>;
}

// const REGISTERED_SERIALIZERS: Map < SerializationFormat, Map < string,
//     Serializer<unknown, SerializationFormat>>>=new Map();
// REGISTERED_SERIALIZERS.set(SerializationFormat.JSON, new Map());

function RegisterSerializer(name: string, format: SerializationFormat)
{
    return function<C extends {new (...args: any[]) : Serializer<unknown, typeof format>}>(target: C)
    {
        SerializerDictionaryServiceImpl.getInstance().registerSerializer(name, format, new target());

        /*const serializersForFormat: Map<string, Serializer<unknown, typeof format>>|undefined =
            REGISTERED_SERIALIZERS.get(format);
        if (serializersForFormat === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, not found.`);
        }

        serializersForFormat.set(name, new target());*/
    };
}
class SerializerDictionaryServiceImpl implements SerializerDictionaryService
{
    private static SINGLETON_INSTANCE: SerializerDictionaryServiceImpl;

    private readonly serializers: Map<SerializationFormat, Map<string, Serializer<unknown, SerializationFormat>>> =
        new Map();

    private constructor()
    {
        // Should I deep clone instead?
        this.serializers = new Map();
        this.serializers.set(SerializationFormat.JSON, new Map());
    }

    public static getInstance(): SerializerDictionaryServiceImpl
    {
        if (!SerializerDictionaryServiceImpl.SINGLETON_INSTANCE)
        {
            SerializerDictionaryServiceImpl.SINGLETON_INSTANCE = new SerializerDictionaryServiceImpl();
        }
        return SerializerDictionaryServiceImpl.SINGLETON_INSTANCE;
    }

    registerSerializer<T>(name: string, format: SerializationFormat, serializer: Serializer<T, typeof format>): void
    {
        const serializersForFormat: Map<string, Serializer<unknown, typeof format>>|undefined =
            this.serializers.get(format);
        if (serializersForFormat === undefined)
        {
            throw new Error(`Dictionary for format, ${format}, not found.`);
        }

        serializersForFormat.set(name, serializer);
    }

    getSerializer<T>(serializationDescriptor: SerializableDescriptor,
                     format: SerializationFormat): Serializer<T, typeof format>
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

        // This is ugly, but don't know another way, as we're narrowing the generic here from unknown to a specific type
        // of Serializable<T> The other approach, which we may need to move to in the future, is to have separate maps
        // for each type, T.  Need to think see if that's possible
        return serializerToReturn as Serializer<T, typeof format>;
    }
}

export type{SerializerDictionaryService};
export {SerializerDictionaryServiceImpl, RegisterSerializer}