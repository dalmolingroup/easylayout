test_that("function easylayout exists", {
  func_easylayout_exists <- exists(
    x = "plot",
    where = "package:easylayout",
    mode = "function"
  )
  expect_true(func_easylayout_exists)
})
