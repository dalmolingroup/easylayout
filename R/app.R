#' @export
test <- function(){

  server <- function(input, output, session) {
    session$sendCustomMessage(type = "dataTransferredFromServer", 1)
  }

  shiny::addResourcePath("www", system.file("www", package = "easylayout"))

  ui <- shiny::htmlTemplate(
    filename = system.file("www/index.html", package = "easylayout")
  )

  shiny::runGadget(shiny::shinyApp(ui = ui, server))
}