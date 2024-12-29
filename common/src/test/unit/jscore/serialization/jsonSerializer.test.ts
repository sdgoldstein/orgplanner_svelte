import {
    BaseJSONSerializer,
    JSONSerializationHelper,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
} from "orgplanner-common/jscore";
import {describe, test} from "vitest";

describe("jsonSerializer", () => {
    describe("BaseJSONSerializer", () => {
        test("serialize", () => {
            const testSerializable = new TestSerializable();
            const helper = new JSONSerializationHelper();
            const jsonSerializerTest = new TestSerializableSerializer();

            //@ts-ignore
            const result = jsonSerializerTest.serialize(testSerializable, helper);
            console.log(result);
        });
    });
});

@RegisterSerializable("TestSerializable", 1)
class TestSerializable
{
    public stringProperty: string = "stringProperty";
    public numberProperty: number = 1;
    public booleanProperty: boolean = true;
    public objectProperty: any = new NestedTestSerializable();
    public arrayProperty: any[] = [ "valueA" ];
    public setProperty: Set<any> = new Set([ "valueS" ]);
    public mapProperty: Map<string, any> = new Map([ [ "keyM", "valueM" ] ]);
    public dateProperty: Date = new Date();
    public undefinedProperty: any = undefined;
    public nullProperty: any = null;
    public functionProperty: any = function() {};
    public symbolProperty: any = Symbol("symbol");
}

class TestSerializableSerializer extends BaseJSONSerializer<TestSerializable>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): TestSerializable
    {
        const result = new TestSerializable();
        result.stringProperty = dataObject["stringProperty"];
        result.numberProperty = dataObject["numberProperty"];
        result.booleanProperty = dataObject["booleanProperty"];
        result.objectProperty = dataObject["objectProperty"];
        result.arrayProperty = dataObject["arrayProperty"];
        result.setProperty = dataObject["setProperty"];
        result.mapProperty = dataObject["mapProperty"];
        result.dateProperty = dataObject["dateProperty"];
        result.undefinedProperty = dataObject["undefinedProperty"];
        result.nullProperty = dataObject["nullProperty"];
        result.functionProperty = dataObject["functionProperty"];
        result.symbolProperty = dataObject["symbolProperty"];
        return result;
    }
}

@RegisterSerializable("NestedTestSerializable", 1)
class NestedTestSerializable
{
    public nestedStringProperty: string = "nestedStringProperty";
}

@RegisterSerializer("NestedTestSerializable", SerializationFormat.JSON)
class NestedTestSerializableSerializer extends BaseJSONSerializer<NestedTestSerializable>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): NestedTestSerializable
    {
        const result = new NestedTestSerializable();
        result.nestedStringProperty = dataObject["nestedStringProperty"];
        return result;
    }
}

// export NestedTestSerializable so it's used and TypeScript doesn't complain - FIXME
export {NestedTestSerializableSerializer};