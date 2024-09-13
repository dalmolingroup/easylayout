#' @export
test <- function(graph) {
  if (is.null(igraph::V(graph)$name)) {
    igraph::V(graph)$name <- as.character(1:igraph::vcount(graph))
  }

  graph_json <- jsonlite::toJSON(list(
    nodes = igraph::as_data_frame(graph, "vertices"),
    links = igraph::as_data_frame(graph, "edges")
  ))

  server <- function(input, output, session) {
    shiny::observeEvent(input$svelteAppMounted, {
      print("svelteAppMounted:")
      print(input$svelteAppMounted)
      if (input$svelteAppMounted) {
        session$sendCustomMessage(
          type = "dataTransferredFromServer",
          message = graph_json
        )
      }
    })
  }

  shiny::addResourcePath("www", system.file("www", package = "easylayout"))

  ui <- shiny::htmlTemplate(
    filename = system.file("www/index.html", package = "easylayout")
  )

  shiny::runGadget(shiny::shinyApp(ui = ui, server))
}
