<script>
    import "../app.css";

    import OrgPlannerAppHeader from "@src/components/app/appheader/OrgPlannerAppHeader.svelte";
    import PageHeader from "@src/components/page/header/PageHeader.svelte";
</script>

<OrgPlannerAppHeader></OrgPlannerAppHeader>
<PageHeader></PageHeader>

<slot></slot>
