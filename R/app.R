rescale <- function(x, from, to) approxfun(range(x), c(from, to))(x)

has_at_least_two_values <- function(x) length(unique(x)) > 1

#' @export
easylayout <- function(graph) {

  # From github.com/daniloimparato/easylayout_old/blob/fdb800aec4852dddcdaec11a4bae1dc1c5d770b9/R/vivagraph.R
  precompute_iterations   = 1000
  initial_size_multiplier = 75
  pin_nodes               = FALSE
  pin_threshold           = 4
  pinned_cols             = 2
  pinned_rows             = "auto"
  pinned_size_multiplier  = 20
  lcc_margin_left         = 300

  # Nodes must have some sort of identifier.
  # Falls back to 1, 2, 3... if "name" is not available.
  if (is.null(igraph::V(graph)$name)) {
    igraph::V(graph)$name <- as.character(1:igraph::vcount(graph))
  }

  if (pinned_rows == "auto") {
    pinned_rows <- 0
  }

  subgraphs <- igraph::decompose.graph(graph)
  subgraphs_sizes <- sapply(subgraphs, igraph::vcount) <= pin_threshold
  subgraphs_to_pin <- subgraphs_sizes <= pin_threshold

  # Magic precomputing
  vertices <- igraph::as_data_frame(graph, "vertices")
  numeric_columns <- vertices |>
    dplyr::select(-name) |>
    dplyr::select_if(is.numeric) |>
    dplyr::select_if(has_at_least_two_values)

  # Precomputing only works if there are numeric columns
  if(all(numeric_columns |> dim()) != 0){

    g_v <- numeric_columns |>
      apply(2, rescale, from = 0.001, to = 1) |>
      dist() |>
      as.matrix()

    g_v <- 1/g_v^2

    g_v[g_v == Inf] <- max(g_v[g_v != max(g_v)])
    # g_v[g_v <= 1] <- 0

    row.names(g_v) <- igraph::V(graph)$name
    colnames(g_v)  <- igraph::V(graph)$name

    dist_graph <- igraph::graph_from_adjacency_matrix(g_v, mode = "undirected", weighted = TRUE, diag = FALSE)

    dist_layout <- igraph::layout_with_fr(dist_graph, niter = precompute_iterations) * initial_size_multiplier

    V(graph)$x <- dist_layout[,1]
    V(graph)$y <- dist_layout[,2]
  }

  if(is.matrix(layout)){
    igraph::V(graph)$x <- layout[,1]
    igraph::V(graph)$y <- layout[,2]
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

    shiny::observeEvent(input$coordinates, {
      if (!is.null(input$coordinates)) shiny::stopApp(input$coordinates)
    })
  }

  shiny::addResourcePath("www", system.file("www", package = "easylayout"))

  ui <- shiny::htmlTemplate(
    filename = system.file("www/index.html", package = "easylayout")
  )

  layout <- shiny::runGadget(shiny::shinyApp(ui = ui, server))

  layout <- matrix(layout, ncol = 2, byrow = TRUE)

  layout[,2] <- -1 * layout[,2]

  layout
}
