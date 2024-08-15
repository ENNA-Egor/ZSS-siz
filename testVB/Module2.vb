'Procedure:   RowHeightForContent
' Author    : The_Prist(???????? ???????)
'             http://www.excel-vba.ru
' Purpose   : Ôóíêöèÿ ïîäáèðàåò âûñîòó ñòðîêè/ øèðèíó ñòîëáöà îáúåäèí¸ííûõ ÿ÷ååê ïî ñîäåðæèìîìó
'---------------------------------------------------------------------------------------
Function RowColHeightForContent(rc As Range, Optional bRowHeight As Boolean = True)
'rc -         ÿ÷åéêà âûñîòó ñòðîêè èëè øèðèíó ñòîëáöàêîòîðîé íåîáõîäèìî ïîäîáðàòü
'bRowHeight - True - åñëè íåîáõîäèìî ïîäîáðàòü âûñîòó ñòðîêè
'             False - åñëè íåîáõîäèìî ïîäîáðàòü øèðèíó ñòîëáöà
    Dim OldR_Height As Single, OldC_Widht As Single
    Dim MergedR_Height As Single, MergedC_Widht As Single
    Dim CurrCell As Range
    Dim ih As Integer
    Dim iw As Integer
    Dim NewR_Height As Single, NewC_Widht As Single
    Dim ActiveCellHeight As Single
 
    If rc.MergeCells Then
        With rc.MergeArea 'åñëè ÿ÷åéêà îáúåäèíåíà
            'çàïîìèíàåì êîëè÷åñòâî ñòîëáöîâ
            iw = .Columns(.Columns.Count).Column - rc.Column + 1
            'çàïîìèíàåì êîëè÷åñòâî ñòðîê.
            ih = .Rows(.Rows.Count).Row - rc.Row + 1
            'Îïðåäåëÿåì âûñîòó è øèðèíó îáúåäèíåíèÿ
            MergedR_Height = 0
            For Each CurrCell In .Rows
                MergedR_Height = CurrCell.RowHeight + MergedR_Height
            Next
            MergedC_Widht = 0
            For Each CurrCell In .Columns
                MergedC_Widht = CurrCell.ColumnWidth + MergedC_Widht
            Next
            'çàïîìèíàåì âûñîòó è øèðèíó ïåðâîé ÿ÷åéêè èç îáúåäèí¸ííûõ
            OldR_Height = .Cells(1, 1).RowHeight
            OldC_Widht = .Cells(1, 1).ColumnWidth
            'îòìåíÿåì îáúåäèíåíèå ÿ÷ååê
            .MergeCells = False
            'Íàçíà÷àåì íîâóþ âûñîòó è øèðèíó äëÿ ïåðâîé ÿ÷åéêè
            .Cells(1).RowHeight = MergedR_Height
            .Cells(1, 1).EntireColumn.ColumnWidth = MergedC_Widht
            'åñëè íåîáõîäèìî èçìåíèòü âûñîòó ñòðîê
            If bRowHeight Then
                '.WrapText = True 'Ðàñêîìåíòèðîâàòü åñëè íåîáõîäèìî óñòàíîâèòü ïðèíóäèòåëüíûé ïåðåíîñ òåêñòà
                .EntireRow.AutoFit
                NewR_Height = .Cells(1).RowHeight    'çàïîìèíàåì âûñîòó ñòðîêè
                .MergeCells = True
                If OldR_Height < (NewR_Height / ih) Then
                    .RowHeight = NewR_Height / ih
                Else
                    .RowHeight = OldR_Height
                End If
                'âîçâðàùàåì øèðèíó ñòîëáöà ïåðâîé ÿ÷åéêè
                .Cells(1, 1).EntireColumn.ColumnWidth = OldC_Widht
            Else 'åñëè íåîáõîäèìî èçìåíèòü øèðèíó ñòîëáöà
                .EntireColumn.AutoFit
                NewC_Widht = .Cells(1).EntireColumn.ColumnWidth    'çàïîìèíàåì øèðèíó ñòîëáöà
                .MergeCells = True
                If OldC_Widht < (NewC_Widht / iw) Then
                    .ColumnWidth = NewC_Widht / iw
                Else
                    .ColumnWidth = OldC_Widht
                End If
                'âîçâðàùàåì âûñîòó ïåðâîé ÿ÷åéêè
                .Cells(1, 1).RowHeight = OldR_Height
            End If
        End With
    End If
End Function
