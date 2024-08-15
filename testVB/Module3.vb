Sub FontSrEdit()
Dim RangEd As Range
ThisWorkbook.Worksheets("Ëèñò1").Activate
RangEd = ActiveSheet.Range("A1:P40").Select
RangEd.Font.Color = RGB(200, 150, 250)

End Sub