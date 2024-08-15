Sub LessBorder()

    Dim SellRg As Range
    Dim r As Integer
    Dim WorkS As Worksheet
    Dim Ost As Boolean
   
    
    For r = 3 To 20
        For c = 1 To 20
            
            ThisWorkbook.Worksheets("ÁëàãîÑåðâèñ").Cells(r, c).Select
                Ost = r Mod 2
                If Ost = False Then
                    Call RangeStyle_1
                    Else
                    Call RangeStyle_2
                End If
        Next c
    Next r


End Sub



Sub ChetNeChet()
Dim Ost As Boolean
    For r = 1 To 25
    Ost = r Mod 2
    MsgBox Ost
    
    Next r


End Sub
