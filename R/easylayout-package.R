#' easylayout: Publication-Ready Networks Directly in your IDE
#'
#' The `easylayout` package seamlessly bridges manipulation and visualization
#' by leveraging the user’s IDE itself (e.g., RStudio, VSCode). It is not yet
#' another visualization library, but instead aims to interconnect existing
#' libraries and streamline their usage into the R ecosystem. Easylayout takes
#' an igraph object and serializes it into a web application integrated with
#' the IDE’s interface through a Shiny server. The web application lays out the
#' network by simulating attraction and repulsion forces. Simulation parameters
#' can be adjusted in real-time. An editing mode allows moving and rotating
#' nodes. The implementation aims for performance, so that even lower-end
#' devices are able to work with relatively large networks. Once the user
#' finishes tinkering the layout, it is sent back to the R session to be
#' plotted through popular libraries like ggplot2 or even the base package
#' itself.
#'
#' @docType package
#' @name easylayout-package
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
