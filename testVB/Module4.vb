Public firm As String

Public firmMag As String

Dim LastRow As Long


'Sub Counter()
'Dim CounterRow As Long
'CounterRow = ThisWorkbook.Worksheets("Лист2").Range("B3:B14").Rows.Count
'MsgBox CounterRow


'End Sub

'Sub LastLine()
'
'Dim LastRow As Long
'Dim Num As Long
'Dim NumOf As Long
'Dim ColummnNamber As Long
'Dim OffsetNumber As Long
'ColummnNamber = 2
'
'
'LastRow = ThisWorkbook.Worksheets(firm).Cells(Rows.Count, ColummnNamber).End(xlUp).Row
'
'Num = Cells((LastRow - 1), ColummnNamber).Value
''If (Num = 0) Then
'OffsetNumber = 1
''Else: OffsetNumber = 0
''End If
'NumOf = Num + 1
'
'ThisWorkbook.Worksheets(firm).Cells(LastRow, ColummnNamber).Offset(OffsetNumber, 0) = NumOf
'
'End Sub

Sub MagzineRecord(Type_of_inspection)
Dim listobjMagazineList As ListObject
      'firm = "ГрадСервис"
      'firmMag = "MagazineGS"
      '///////////////////////////////////////////////////////////////////
      
      Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Наименование подпапки
                            For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
                                    If rgCellChecked.Value = UserForm1.ComboBox1.Value Then
                                     firm = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Пр. мин").DataBodyRange)
                                     'firmMag = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("firmMag").DataBodyRange)
                                    End If
                        Next rgCellChecked
      
      '////////////////////////////////////////////////////////////////////
      'Call LastLine
Dim LastRow As Long
Dim Num As Variant
Dim NumOf As Long
Dim ColummnNamber As Long
Dim OffsetNumber As Long
ColummnNamber = 2
OffsetNumber = 1
ThisWorkbook.Worksheets(firm).Activate
LastRow = ThisWorkbook.Worksheets(firm).Cells(Rows.Count, ColummnNamber).End(xlUp).Row

Num = Cells((LastRow), ColummnNamber).Value
If (Num = "№п.п") Then
NumOf = 1
Else: NumOf = Num + 1
End If
'NumOf = Num + 1

ThisWorkbook.Worksheets(firm).Cells(LastRow, ColummnNamber).Offset(OffsetNumber, 0) = NumOf

'////////////////////////////////////////////////////////////////////////////////////////////////
      
      
       ' Set listobjMagazineList = ThisWorkbook.Worksheets(firm).ListObjects(firmMag)
        
    Dim objControlChecked As Object
    Dim strTagArray() As String
    Dim DataCreat As Date
    
                DataCreat = Now()
               ' ValM = DatePart("mm", Now)
                'ValY = DatePart("yyyy", Now)
                DataCreat = Format(Now, "dd.mm.yyyy")

    'Начало внесения значений в Data Table
 'Запись цельных значений
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 3) = UserForm1.ComboBox_FName.Value
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 4) = UserForm1.ComboBox_Name.Value
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 5) = UserForm1.TextBox_OName.Value
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 6) = DataCreat
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 6) = Format(Now, "dd.mmmm.yyyy  hh:mm")
                ThisWorkbook.Worksheets("Лист1").Range("O1").Value = NumOf & "-" & DataCreat
                ThisWorkbook.Worksheets(firm).Cells((LastRow + 1), 7) = Type_of_inspection
                'ThisWorkbook.Worksheets("Лист1").Range("O1") = Format(Now, "yyyy.mm")
'///////////////////////////////////////////////////////////////////////////////////////////////////////

 Dim SellRg As Range
    Dim r As Integer
    Dim WorkS As Worksheet
    Dim Ost As Boolean
   
    r = LastRow + 1
    'For r = 3 To 20
        For c = 2 To 7
            
            ThisWorkbook.Worksheets(firm).Cells(r, c).Select
                Ost = r Mod 2
                If Ost = False Then
                    Call RangeStyle_1
                    Else
                    Call RangeStyle_2
                End If
        Next c
    'Next r



'///////////////////////////////////////////////////////////////////////////////////////////////////////
    
End Sub
