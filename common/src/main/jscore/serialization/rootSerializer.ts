
import {type SerializerDictionaryService, SerializerDictionaryServiceImpl} from "./serializationDictionary";
import type {
    SerializationFormat, SerializedTypeForSerializableFormat, SerializationHelper, Serializable, SerializableDescriptor,
    Serializer} from "./serializationService";

class SerializationHelperDefault<F extends SerializationFormat> implements SerializationHelper<F>
{
    depth: number = 0;

    constructor(private serializationFormat: F) {}
    serialize<T extends Serializable>(serializableObject: T): SerializedTypeForSerializableFormat<F>
    {
        this.depth++;

        const serializationDescriptor: SerializableDescriptor = serializableObject.getSerializableDescriptor();

        if (serializationDescriptor === undefined)
        {
            throw new Error(`Failed to retrieve serialization descriptor for object`)
        }

        const dictionaryService: SerializerDictionaryService = SerializerDictionaryServiceImpl.getInstance();

        const serializer: Serializer<T, F> =
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

interface RootSerializer<F extends SerializationFormat>
{
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

export type{RootSerializer};
export {BaseRootSerializer, SerializationHelperDefault};