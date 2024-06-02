<script lang="ts">
    import { NavUl, NavLi } from "flowbite-svelte";
</script>

<NavUl
    divClass="flex justify-between items-center w-auto"
    ulClass="flex font-medium space-x-8 border-0"
    hidden={false}
>
    <NavLi href="/" active={true}>New</NavLi>
    <NavLi href="/">Import</NavLi>
    <NavLi href="/">Export</NavLi>
    <NavLi href="/">Org Design Theory</NavLi>
    <NavLi href="/">Help</NavLi>
</NavUl>
