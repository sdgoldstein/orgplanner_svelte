import type {Snippet} from "svelte";

interface BaseComponentProps
{
    id?: string;
    class
    ?: string;
}

interface ParentComponentProps extends BaseComponentProps
{
    children: Snippet;
}

interface OptionalParentComponentProps extends BaseComponentProps
{
    children?: Snippet;
}

export type {ParentComponentProps, OptionalParentComponentProps, BaseComponentProps};