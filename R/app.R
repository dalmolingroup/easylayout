#' Layout an igraph object using easylayout's web application.
#'
#' The `easylayout` function takes an igraph object and serializes`
#' it into a web application integrated with the IDE’s interface
#' through a Shiny server. The web application lays out the network by
#' simulating attraction and repulsion forces. Simulation parameters
#' can be adjusted in real-time. An editing mode allows moving and rotating
#' nodes. Once the user finishes tinkering the layout, it is sent back to the
#' R session to be plotted through popular libraries like ggplot2 or even the
#' base package itself.
#'
#' @param graph An igraph object representing the network to be laid out.
#' @return A two column matrix with XY coordinates and N rows, where N is
#' the number of vertices in the graph.
#' @examples
#' \dontrun{
#' library(igraph)
#' g <- make_ring(10)
#' g <- easylayout(g)
#' plot(g)
#' }
#' @export
easylayout <- function(graph) {
  # Nodes must have some sort of identifier.
  # Falls back to 1, 2, 3... if "name" is not available.
  if (is.null(igraph::V(graph)$name)) {
    igraph::V(graph)$name <- as.character(1:igraph::vcount(graph))
  }

  if (is.matrix(layout)) {
    print("Loading user-specified initial layout...")
    return(start_app(graph, layout))
  }

  hash <- igraph::as_edgelist(graph) |> digest::digest()
  cached_layout <- get_layout(hash)

  if (!is.null(cached_layout)) {
    print("Using cached layout from previous run...")
    return(start_app(graph, cached_layout$layout))
  }

  # Magic precomputing
  vertices <- igraph::as_data_frame(graph, "vertices")
  numeric_columns <- vertices |>
    dplyr::select(-name) |>
    dplyr::select_if(is.numeric) |>
    dplyr::select_if(has_at_least_two_values)

  factor_columns <- vertices |>
    dplyr::select(-name) |>
    dplyr::select_if(is.factor) |>
    dplyr::mutate(dplyr::across(dplyr::everything(), ~as.numeric))

  bound_columns <- cbind(numeric_columns, factor_columns)

  # Precomputing only works if there are numeric columns
  columns_not_empty <- all(bound_columns |> dim() > 0)

  if (columns_not_empty) {
    print("easylayout will use the following columns to precompute initial positions:")
    print(colnames(bound_columns))

    precomputed_layout <- precompute_layout(graph = graph, cols = bound_columns)
    return(start_app(graph, precomputed_layout))
  }

  # If any of the previous attempts at retrieving an initial layout failed,
  # then we just run the app without any initial layout
  return(start_app(graph))
}

start_app <- function(graph, layout) {
  if (!missing(layout)) {
    # Browser stuff generally considers [0, 0] to be the top-left corner
    # of the screen, therefore we need to invert the Y axis
    igraph::V(graph)$y <- layout[, 2] * -1
    igraph::V(graph)$x <- layout[, 1]
  }

  graph_components <- igraph::components(graph)
  largest_component_id <- graph_components$csize |> which.max()

  # Only nodes outside the largest component
  # will receive special treatment in the web app
  flag_for_grouping <- ifelse(
    test = graph_components$membership == largest_component_id,
    yes = NA,
    no = as.character(graph_components$membership)
  )

  igraph::V(graph)$component <- flag_for_grouping

  selected_node_cols <- graph |>
    igraph::as_data_frame("vertices") |>
    dplyr::select(
      id = name,
      initialX = x,
      initalY = y,
      component,
      tidyselect::any_of(c("color", "size"))
    )

  graph_json <- jsonlite::toJSON(list(
    nodes = selected_node_cols,
    links = igraph::as_data_frame(graph, "edges")[, 1:2]
  ))

  server <- function(input, output, session) {
    shiny::observeEvent(input$svelteAppMounted, {
      print("easylayout is ready. Happy layouting!")
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

  layout[, 2] <- -1 * layout[, 2]

  hash <- igraph::as_edgelist(graph) |> digest::digest()

  set_layout(hash, list(layout = layout, opts = "lalala"))

  layout
}

precompute_layout <- function(graph, cols) {
  LAYOUT_SIZE_FACTOR <- 75
  
  distance_matrix <- cols |>
    apply(2, rescale, from = 0, to = 1) |>
    dist() |>
    as.matrix()

  similarity_matrix <- 1 / (distance_matrix^2)

  similarity_matrix[similarity_matrix == Inf] <- max(similarity_matrix[similarity_matrix < Inf])

  row.names(similarity_matrix) <- igraph::V(graph)$name
  colnames(similarity_matrix) <- igraph::V(graph)$name

  similarity_graph <- igraph::graph_from_adjacency_matrix(
    adjmatrix = similarity_matrix,
    mode = "undirected",
    weighted = TRUE,
    diag = FALSE
  )

  similarity_layout <- igraph::layout_with_fr(
    graph = similarity_graph,
    niter = 1000
  ) * LAYOUT_SIZE_FACTOR

  # Centers layout around origin = [0, 0]
  similarity_layout[, 1] <- similarity_layout[, 1] - mean(similarity_layout[, 1])
  similarity_layout[, 2] <- similarity_layout[, 2] - mean(similarity_layout[, 2])

  similarity_layout
}

rescale <- function(x, from, to) approxfun(range(x), c(from, to))(x)

has_at_least_two_values <- function(x) length(unique(x)) > 1

# https://hydroecology.net/implementing-session-cache-r-packages/
# https://github.com/tidyverse/ggplot2/blob/main/R/plot-last.R
.layout_store <- function() {
  .layout_map <- NULL

  list(
    get = function(hash) .layout_map[[hash]],
    set = function(hash, value) .layout_map[[hash]] <<- value
  )
}
.store <- .layout_store()

set_layout <- function(hash, value) .store$set(hash, value)

get_layout <- function(hash) .store$get(hash)
