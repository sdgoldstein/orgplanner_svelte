<svelte:options runes={true} />

<script lang="ts">
    import Image from "@src/components/ui/Image.svelte";
    import { NavBrand } from "flowbite-svelte";
</script>

<NavBrand href="/">
    <Image
        src="organization-chart-icon.png"
        alt="Org Chart Icon"
        className="mr-3 h-11 w-11"
    />
    <span class="self-center text-xl font-semibold whitespace-nowrap"
        >Organization Architect</span
    >
</NavBrand>
