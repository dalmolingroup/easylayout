#' @export
test <- function(){

  server <- function(input, output, session) {
    session$sendCustomMessage(type = "dataTransferredFromServer", 1)
  }

  shiny::addResourcePath("www", system.file("www", package = "easylayout"))

  shiny::runGadget(shiny::shinyApp(ui = shiny::htmlTemplate(system.file("www/index.html", package = "easylayout")), server))
}