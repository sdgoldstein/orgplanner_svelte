import {BaseRootSerializer, SerializationHelperDefault} from "./rootSerializer";
import {type SerializerDictionaryService, SerializerDictionaryServiceImpl} from "./serializationDictionary";
import {
    SerializationFormat,
    type Serializable,
    type SerializableDescriptor,
    type SerializationHelper,
    type SerializedTypeForSerializableFormat,
    type Serializer
} from "./serializationService";

class JSONSerializationHelper extends SerializationHelperDefault<SerializationFormat.JSON> implements
    SerializationHelper<SerializationFormat.JSON>
{
    constructor()
    {
        super(SerializationFormat.JSON);
    }

    deserialize<T>(data: SerializedTypeForSerializableFormat<SerializationFormat.JSON>): T
    {
        const parsedObject: any = JSON.parse(data);

        return this.deserializeObject(parsedObject);
    }

    deserializeObject<T>(dataObject: any): T
    {
        const serializationDescriptor: SerializableDescriptor = dataObject.serializationDescriptor;

        const dictionaryService: SerializerDictionaryService = SerializerDictionaryServiceImpl.getInstance();

        // FIXME - is there a better way than casting here
        const serializer: BaseJSONSerializer<T> =
            dictionaryService.getSerializer(serializationDescriptor, SerializationFormat.JSON) as BaseJSONSerializer<T>;

        return serializer.deserializeObject(dataObject, this);
    }
}

class RootJSONSerializer extends BaseRootSerializer<SerializationFormat.JSON>
{
    createHelper(): SerializationHelper<SerializationFormat.JSON>
    {
        return new JSONSerializationHelper();
    }
}

abstract class BaseJSONSerializer<T> implements Serializer<T, SerializationFormat.JSON>
{
    serialize(serializableObject: Serializable,
              serializationHelper: SerializationHelper<SerializationFormat.JSON>): string
    {
        let json = "{";

        const serializationDescriptor = serializableObject.getSerializableDescriptor();
        json = this._addLineAndIndent(json, serializationHelper.depth);
        let serializationDescriptorJSON = "{"
        serializationDescriptorJSON =
            this._addLineAndIndent(serializationDescriptorJSON, serializationHelper.depth + 1);
        serializationDescriptorJSON += this._serializeKey("name", serializationDescriptor.name);
        serializationDescriptorJSON += ","
        serializationDescriptorJSON =
            this._addLineAndIndent(serializationDescriptorJSON, serializationHelper.depth + 1);
        serializationDescriptorJSON +=
            this._serializeKey("objectVersion", serializationDescriptor.objectVersion.toString());
        serializationDescriptorJSON = this._addLineAndIndent(serializationDescriptorJSON, serializationHelper.depth);
        serializationDescriptorJSON += "},"

        json += this._serializeKey("serializationDescriptor", serializationDescriptorJSON);

        const objectValue: Record<string, string> = this.getValue(serializableObject, serializationHelper);

        const objectValueEntries = Object.entries(objectValue);

        for (let i = 0; i < objectValueEntries.length; i++)
        {
            const [nextKey, nextValue] = objectValueEntries[i];

            json = this._addLineAndIndent(json, serializationHelper.depth);
            json += this._serializeKey(nextKey, nextValue);

            if (i < (objectValueEntries.length - 1))
            {
                json += ",";
            }
        }

        json = this._addLineAndIndent(json, serializationHelper.depth - 1);
        json += "}"

        return json;
    }

    protected serializeIterable(serializableIterator: IterableIterator<any>,
                                serializationHelper: SerializationHelper<SerializationFormat.JSON>): string
    {
        let json = "[";

        let nextSerializable = serializableIterator.next();
        while (!nextSerializable.done)
        {
            json += this._serializeNestedValue(nextSerializable.value, serializationHelper);

            nextSerializable = serializableIterator.next();

            if (!nextSerializable.done)
            {
                json += ",";
                json = this._addLineAndIndent(json, serializationHelper.depth);
            }
        }

        json += "]";

        return json;
    }

    deserialize(data: string, serializationHelper: SerializationHelper<SerializationFormat.JSON>): T
    {
        throw new Error("Method not implemented.");
    }

    abstract deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): T;

    getValue(serializableObject: any,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const result: Record<string, string> = {};

        for (const key in serializableObject)
        {
            const value = serializableObject[key];
            if (!this._ignoredDuringSerialization(value))
            {
                result[key] = this._serializeNestedValue(value, serializationHelper);
            }
        }

        return result;
    }

    private _serializeNestedValue(value: any,
                                  serializationHelper: SerializationHelper<SerializationFormat.JSON>): string
    {
        let valueToReturn: string;

        if (this._isObject(value))
        {
            if (this._isIterable(value))
            {
                valueToReturn = this.serializeIterable(value[Symbol.iterator](), serializationHelper);
            }
            else
            {
                valueToReturn = serializationHelper.serialize(value);
            }
        }
        else
        {
            valueToReturn = value.toString();
        }
        return valueToReturn;
    }

    private _isIterable(value: any): boolean
    {
        return (typeof value[Symbol.iterator] === "function");
    }

    private _isObject(value: any): boolean
    {
        return typeof value === "object" && value instanceof Date === false;
    }

    private _ignoredDuringSerialization(value: any): boolean
    {
        return this._isUndefined(value) || this._isNull(value) || this._isFunction(value) || this._isSymbol(value);
    }

    private _isUndefined(value: any): boolean
    {
        return value === undefined;
    }

    private _isNull(value: any): boolean
    {
        return value === null;
    }

    private _isFunction(value: any): boolean
    {
        return typeof value === "function";
    }

    private _isSymbol(value: any): boolean
    {
        return typeof value === "symbol";
    }

    private _serializeKey(key: string, value: string): string
    {
        // FIXME - Hack for now.  Ideally, values need to not just be strings but objects that indicate, value,
        // object value, or array value
        let valueToInclude = value.startsWith("{") || value.startsWith("[") ? value : `"${value}"`;
        return `"${key}": ${valueToInclude}`;
    }

    private _addLineAndIndent(json: string, depth: number): string
    {
        json += "\n";
        for (let i = 0; i < depth; i++)
        {
            json += "\t";
        }

        return json;
    }
}

class JSONStringBuilder
{
    private _commaNeeded: boolean = false;
    private _json: string = "{";
    private _indentLevel = 1;

    private appendPre(): void
    {
        this._addCommaIfNeeded();
        this._addLineAndIndent();
    }

    appendKey(key: string, value: string): void
    {
        this.appendPre();
        this._json += `"${key}": "${value}"`;
        this._setCommaNeeded();
    }

    appendBooleanKey(key: string, value: boolean): void
    {
        this.appendPre();
        this._json += `"${key}": ${value}`;
        this._setCommaNeeded();
    }

    appendObjectKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": {`;
        this._indentLevel++;
    }

    appendArrayKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": [`;
        this._indentLevel++;
    }

    appendArrayObjectValue(): void
    {
        this.appendPre();
        this._json += "{";
        this._indentLevel++;
    }

    closeArrayObjectValue(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    closeArrayKey(): void
    {
        this._indentLevel--;

        this._addLineAndIndent();

        this._json += "]";

        this._setCommaNeeded();
    }

    closeObjectKey(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    private _addLineAndIndent(): void
    {
        this._json += "\n";
        for (let i = 0; i < this._indentLevel; i++)
        {
            this._json += "\t";
        }
    }

    private _addCommaIfNeeded(): void
    {
        if (this._commaNeeded)
        {
            this._json += ",";
            this._commaNeeded = false;
        }
    }

    private _setCommaNeeded(): void
    {
        this._commaNeeded = true;
    }

    toString(): string
    {
        this._json += "\n}";
        return this._json;
    }
}

export {BaseJSONSerializer, JSONStringBuilder, RootJSONSerializer, JSONSerializationHelper};