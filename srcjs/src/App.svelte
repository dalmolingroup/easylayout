<script>import "./app.css";
import Graph from "./lib/Graph.svelte";
import Editor from "./lib/Editor.svelte";
import Viva from "vivagraphjs";
import forceLayoutViva from "./lib/forceLayoutViva";
import forceLayoutD3 from "./lib/forceLayoutD3";
import { isSimulationRunning, isEditorMode } from "./store.js";
import { onMount } from "svelte";
import { nodeLoadTransform, linkLoadTransform } from "./lib/customTransformFromRToViva";

import { Sidebar, SidebarGroup, SidebarWrapper, Button, CloseButton, Label, Input, Textarea } from 'flowbite-svelte';
import { ChartPieSolid, } from 'flowbite-svelte-icons';

let graph;

let selectedLayoutName = "viva";
let availableLayouts = { viva: forceLayoutViva, d3: forceLayoutD3 };

function switchLayout() {
  selectedLayoutName = selectedLayoutName === "viva" ? "d3" : "viva";
}

function toggleSimulation() {
  $isSimulationRunning = !$isSimulationRunning;
}

async function handleShinyData(graphJSON) {
  console.log("Received Shiny data:");
  console.log(graphJSON);
  
  if (import.meta.env.DEV) {
    graphJSON = (await import('./lib/graphJSON.dev.js')).default;
  }
  
  graph = Viva.Graph.serializer().loadFromJSON(
    graphJSON,
    nodeLoadTransform(graphJSON),
    linkLoadTransform(graphJSON),
  );
}

function toggleEditorMode() {
  $isEditorMode = !$isEditorMode;
}

let sidebarVisible = false;

function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  console.log(sidebarVisible);
}

onMount(() => {
  jQuery(document).on("shiny:connected", function () {
    console.log("Shiny connected");
    Shiny.addCustomMessageHandler(
      "dataTransferredFromServer",
      handleShinyData,
    );
    Shiny.setInputValue("svelteAppMounted", true);
  });
});
</script>
  
{#if sidebarVisible}
<div class="fixed z-50 top-0 left-0 w-full">
  <Sidebar>
    <SidebarWrapper>
      <SidebarGroup>
        <div class="flex items-center">
          <h5 id="drawer-label" class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
            <ChartPieSolid class="w-5 h-5 me-2.5" />Contact us
          </h5>
          <CloseButton on:click={toggleSidebar} class="mb-4 dark:text-white" />
        </div>
        <form action="#" class="mb-6">
          <div class="mb-6">
            <Label for="email" class="block mb-2">Your email</Label>
            <Input id="email" name="email" required placeholder="name@company.com" />
          </div>
          <div class="mb-6">
            <Label for="subject" class="block mb-2">Subject</Label>
            <Input id="subject" name="subject" required placeholder="Let us know how we can help you" />
          </div>
          <div class="mb-6">
            <Label for="message" class="mb-2">Your message</Label>
            <Textarea id="message" placeholder="Your message..." rows="4" name="message" />
          </div>
          <Button type="submit" class="w-full">Send message</Button>
        </form>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</div>
{/if}

<main class="container flex flex-col h-screen">

  <div class="fixed bg-cyan-400">
    {#if !$isEditorMode}
      <button on:click="{switchLayout}">
        Switch layout (now: {selectedLayoutName})
      </button>

      <button on:click="{toggleSimulation}">
        {$isSimulationRunning ? "Pause" : "Continue"} simulation
      </button>
    {/if}
    
    <button on:click="{toggleEditorMode}">
      {$isEditorMode ? "Leave editor" : "Enter editor"}
    </button>
  </div>

  <div class="flex flex-grow bg-yellow-100">
    {#if graph && !$isEditorMode}
      {#key selectedLayoutName}
        <Graph {graph} layoutSpecification={availableLayouts[selectedLayoutName]}/>
      {/key}
    {:else if $isEditorMode}
      <Editor {graph}/>
    {:else}
      <p>Loading graph....</p>
    {/if}
  </div>

</main>


<style>
</style>
