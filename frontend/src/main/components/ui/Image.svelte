<script lang="ts">
  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }

  let { src, alt, width, height, className }: ImageProps = $props();
</script>

<img
  {src}
  {alt}
  width={width ? `{width}px` : ""}
  height={height ? `{height}px` : ""}
  class={className ? className : ""}
/>
