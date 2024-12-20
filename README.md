
<!-- README.md is generated from README.Rmd. Please edit that file -->

# easylayout: an R package for interactive force-directed layouts within RStudio <img src="https://github.com/user-attachments/assets/87ce78cf-53cc-4c07-8238-b138d62a4ca6" height="140" align="right" style="padding-left:10px;" />

<!-- badges: start -->

[![R-CMD-check](https://github.com/dalmolingroup/easylayout/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/dalmolingroup/easylayout/actions/workflows/R-CMD-check.yaml)
<!-- badges: end -->

easylayout is an R package that leverages interactive force simulations
within the IDE itself (e.g., RStudio, VSCode). It is **not** yet another
visualization library, but instead aims to interconnect existing
libraries and streamline their usage into the R ecosystem.

![](https://github.com/user-attachments/assets/1b91cb11-77ef-47a5-b529-3805a9785a76)

easylayout takes an igraph object and serializes it into a web
application integrated with the IDE’s interface through a Shiny server.
The web application lays out the network by simulating attraction and
repulsion forces. Simulation parameters can be adjusted in real-time. An
editing mode allows moving and rotating nodes. The implementation aims
for performance, so that even lower-end devices are able to work with
relatively large networks. Once the user finishes tinkering the layout,
it is sent back to the R session to be plotted through popular libraries
like ggplot2 or even the base package itself.

## Installation

You can install the development version of easylayout from
[GitHub](https://github.com/) with:

``` r
# install.packages("devtools")
devtools::install_github("dalmolingroup/easylayout")
```

## Example

This is a basic example which shows you how to solve a common problem:

``` r
library(easylayout)
library(igraph)

g <- igraph::erdos.renyi.game(n = 5000, p.or.m = 10000, type = "gnm")

number_of_vertices <- igraph::vcount(g)

igraph::V(g)$label <- NA
igraph::V(g)$size <- sample(1:5, number_of_vertices, replace = TRUE)
igraph::V(g)$color <- sample(rainbow(5), number_of_vertices, replace = TRUE)

plot(g, layout = easylayout, vertex.label = NA, margin = 0)
```

You can also run easylayout as a standalone function, attributing its output
to a variable in your R environment. The output is just a 2-column matrix:

``` r
layout <- easylayout(g)
```

Once you store the final coordinates to a variable, use any plotting package to
display the network. In the example below, we plot the network using ggraph.

``` r
ggraph::ggraph(g, layout = layout) +
  ggraph::geom_edge_link() +
  ggraph::geom_node_point(aes(color = color)) + 
  ggplot2::coord_fixed() +
  ggplot2::theme_void()
```

## Future work

The current implementation focuses on the R ecosystem, but using web
technologies makes it easily portable to similar environments, like
Jupyter Notebooks. We expect this tool to reduce the time spent tweaking
network layouts, allowing researches to generate more compelling
figures.
