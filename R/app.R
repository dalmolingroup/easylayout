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
  precompute_iterations   <- 1000
  initial_size_multiplier <- 75

  # Nodes must have some sort of identifier.
  # Falls back to 1, 2, 3... if "name" is not available.
  if (is.null(igraph::V(graph)$name)) {
    igraph::V(graph)$name <- as.character(1:igraph::vcount(graph))
  }

  graph_components <- igraph::components(graph)
  largest_component_id <- graph_components$csize |> which.max()

  # Nodes outside the largest component
  # will receive special treatment in the web app
  flag_for_grouping <- ifelse(
    test = graph_components$membership == largest_component_id,
    yes = NA,
    no = as.character(graph_components$membership)
  )

  # Magic precomputing
  vertices <- igraph::as_data_frame(graph, "vertices")
  numeric_columns <- vertices |>
    dplyr::select(-name) |>
    dplyr::select_if(is.numeric) |>
    dplyr::select_if(has_at_least_two_values)

  factor_columns <- vertices |>
    dplyr::select(-name) |>
    dplyr::select_if(is.factor) |>
    dplyr::mutate(dplyr::across(dplyr::everything(), ~ as.numeric))

  bound_columns <- cbind(numeric_columns, factor_columns)
  print(head(bound_columns))

  # Precomputing only works if there are numeric columns
  both_dimensions_not_empty <- all(bound_columns |> dim() > 0)

  if (both_dimensions_not_empty) {
    print("The following columns will be used to precompute initial positions:")
    print(colnames(bound_columns))

    distance_matrix <- numeric_columns |>
      apply(2, rescale, from = 0, to = 1) |>
      dist() |>
      as.matrix()

    similarity_matrix <- 1 / (distance_matrix^2)

    similarity_matrix[similarity_matrix == Inf] <- max(similarity_matrix[similarity_matrix < Inf])

    row.names(similarity_matrix) <- igraph::V(graph)$name
    colnames(similarity_matrix)  <- igraph::V(graph)$name

    similarity_graph <- igraph::graph_from_adjacency_matrix(
      adjmatrix = similarity_matrix,
      mode = "undirected",
      weighted = TRUE,
      diag = FALSE
    )

    similarity_layout <- igraph::layout_with_fr(
      graph = similarity_graph,
      niter = precompute_iterations
    ) * initial_size_multiplier


    igraph::V(graph)$x <- similarity_layout[, 1]
    igraph::V(graph)$y <- similarity_layout[, 2]
  }

  # TODO: Handle user given layout
  # if (is.matrix(layout)) {
  #   igraph::V(graph)$x <- layout[, 1]
  #   igraph::V(graph)$y <- layout[, 2]
  # }

  igraph::V(graph)$component <- flag_for_grouping

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

  layout[, 2] <- -1 * layout[, 2]

  layout
}

rescale <- function(x, from, to) approxfun(range(x), c(from, to))(x)

has_at_least_two_values <- function(x) length(unique(x)) > 1
