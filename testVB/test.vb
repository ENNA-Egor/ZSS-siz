Public firm As String
Public firmMag As String
Public CreateData As Date
Public maxDanger As Byte ' Переменная количества вредных факторов

    




Sub FinishVar()
    If MsgBox("Продолжить создание направлений?", vbYesNo + vbInformation, "Внимание") = vbYes Then
        Call RestartForm
        Else: Call CloseSheet
        End If
End Sub



Sub CloseSheet()
   
    Unload Me
    
         ActiveWorkbook.Worksheets("Лист1").Range("A1:P40").Font.Color = RGB(255, 255, 255)
       
       
            Application.DisplayAlerts = False
            ActiveWorkbook.Save
            Application.DisplayAlerts = True
            ActiveWorkbook.Close
 
End Sub

 Sub RestartForm()
        
    Unload Me
       
    UserForm1.Show

End Sub


Private Sub ComboBox_FName_Change()
Call refilingNames(ComboBox_FName.Value)
End Sub

Private Sub ComboBox_Name_Change()
Call refilingOt(ComboBox_FName.Value, ComboBox_Name.Value)
End Sub

Private Sub OptionButton3_Click()
 Me.ComboBox_Prof.Visible = False
 Me.ComboBox_Prof_PO.Visible = True
 Me.TextBoxAdres.Visible = True
 Me.LabelAdres.Visible = True
End Sub
Private Sub OptionButton1_Click()
 Me.ComboBox_Prof.Visible = True
 Me.ComboBox_Prof_PO.Visible = False
 Me.TextBoxAdres.Visible = False
 Me.LabelAdres.Visible = False
End Sub

Private Sub OptionButton2_Click()
 Me.ComboBox_Prof.Visible = True
 Me.ComboBox_Prof_PO.Visible = False
 Me.TextBoxAdres.Visible = False
 Me.LabelAdres.Visible = False
End Sub

Private Sub CreateDokument()

'    Структура тэгов:
'    Delimiter = "_"
'    Ячейка = Range "C2"
    'Обязательное поле = да/нет
    'Цельное или сбоное значение = [UnifidetToRecord/CombinedToRecord/CombinedNotToRecord]
    'Столбец таблицы целое в таблицу  RecordToTable /Сборное в таблицу CombinedRecordToTable/ CombinedNotRecordToTable незаписываем
    Dim strTagArray() As String
    Dim objControlChecked As Object
    'Dim tagRg As Range
        'Set tagRg = strTagArray
    'Dim objFormaList As ListObject
        'Set objFormaList = ThisWorkBoook.Workshets("Лист1").Range(tagRg)

    For Each objControlChecked In Me.Controls  'Проверяем заполнение обязательных полей
        If objControlChecked.Tag <> "" Then
            strTagArray = Split(objControlChecked.Tag, "_")
'            MsgBox strTagArray(1)
'            MsgBox objControlChecked.Visible
            If strTagArray(1) = "да" And objControlChecked.Visible = True Then
                If objControlChecked.Value = "" Then
                    MsgBox "заполните все обязательные поля", vbExclamation
                    Exit Sub
                End If
            End If
        End If
    Next objControlChecked
'
'    If OptionButton1 = True Then 'Заносим данные в базу
'
'    End If

'   Set listobjNameList = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")
'
''            'Проверяем наличие записи в базе
'    For Each rgCellChecked In listobjNameList.ListColumns("Фамилия").DataBodyRange
'        If rgCellChecked.Value = ComboBox_FName Then
'            End If
'    Next rgCellChecked
'         For Each rgCellChecked In listobjNameList.ListColumns("Фамилия").DataBodyRange
'                If rgCellChecked.Offset(0, 1).Value = ComboBox_Name Then
'                End If
'         Next rgCellChecked
'            For Each rgCellChecked In listobjNameList.ListColumns("Фамилия").DataBodyRange
'                    If rgCellChecked.Offset(0, 2).Value = TextBox_OName Then
'                    Else:  MsgBox "Данная запись отсутствыует в базе. Нажмите добавить для внесения дакнных в базу"
'                     Call CommandButton_Record_Click
'                 End If
'
'            Next rgCellChecked
    Call MagzineRecord
    'Call LastLine

    'Внесение значений в направление

    Dim tagRg As String
    Dim objFormaList As ListObject
    Dim rangeData As Range
    Dim dateDateToRecord As Date
    Dim NameToRecord As String
    Dim rangeLinn As Range
    maxDanger = 4  ' Количества вредных факторов


    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("authorized_Tables") 'Заполняем ячейку должности ответственного
    For Each rgCellChecked In listobjTables.ListColumns("Фамилия И.О.").DataBodyRange
        If rgCellChecked.Value = ComboBox2.Value Then
            ThisWorkbook.Worksheets("Лист1").Range("A36") = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Должность").DataBodyRange)
        End If
    Next rgCellChecked

    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("Harmful_factors_Tab") 'Заполняем таблицу вредных факторов
    For Each rgCellChecked In listobjTables.ListColumns("Профессия").DataBodyRange
        If rgCellChecked.Value = ComboBox_Prof.Value Then
            For i = 1 To maxDanger
                 ThisWorkbook.Worksheets("Лист1").Cells((i + 27), 2).EntireRow.AutoFit
                 ThisWorkbook.Worksheets("Лист1").Cells((i + 27), 2) = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Вредный фактор " & i).DataBodyRange)
            Next i
        End If
    Next rgCellChecked

    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Заполняем ячейку адреса 1
    For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
        If rgCellChecked.Value = ComboBox1.Value Then
            ThisWorkbook.Worksheets("Лист1").Range("A5") = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Адрес1").DataBodyRange)
        End If
    Next rgCellChecked


    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Заполняем ячейку адреса 2
    For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
        If rgCellChecked.Value = ComboBox1.Value Then
            ThisWorkbook.Worksheets("Лист1").Range("A6") = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Адрес2").DataBodyRange)
        End If
    Next rgCellChecked

    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Заполняем ячейку телефоны и mail
    For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
        If rgCellChecked.Value = ComboBox1.Value Then
                tel1 = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Телефон").DataBodyRange)
                tel2 = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Телефон/факс").DataBodyRange)
                tel3 = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("email").DataBodyRange)
            ThisWorkbook.Worksheets("Лист1").Range("A7") = tel1 & "   " & tel2 & "   " & tel3

        End If
    Next rgCellChecked


    Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Заполняем ячейки ОГРН
       For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
           If rgCellChecked.Value = ComboBox1.Value Then
                For i = 1 To 13
                    'n = i + 1
                   ThisWorkbook.Worksheets("Лист1").Cells(10, (i + 1)) = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("ОГРН " & i).DataBodyRange)
                Next i
            End If
    Next rgCellChecked


           If OptionButton1 = True Then 'Подчёркиваем периодический или предварительный

    Set rangeLinn = ThisWorkbook.Worksheets("Лист1").Cells(21, 1)
            rangeLinn.Font.Underline = True
    Set rangeLinn = ThisWorkbook.Worksheets("Лист1").Cells(21, 6)
            ThisWorkbook.Worksheets("Лист1").Cells(12, 9).Value = "предварительный"
            rangeLinn.Font.Underline = False
            Else:
    Set rangeLinn = ThisWorkbook.Worksheets("Лист1").Cells(21, 1)
            rangeLinn.Font.Underline = False
    Set rangeLinn = ThisWorkbook.Worksheets("Лист1").Cells(21, 6)
            ThisWorkbook.Worksheets("Лист1").Cells(12, 9).Value = "периодический"
            rangeLinn.Font.Underline = True
            End If

        For Each objControlChecked In Me.Controls
            If objControlChecked.Tag <> "" Then
              strTagArray = Split(objControlChecked.Tag, "_")
               tagRg = strTagArray(0)
                If strTagArray(2) = "UnifidetToRecord" Then   'запись целых значений

                    If objControlChecked.Value = ComboBox1 Then
                        Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Заполняем наименование предприятия
                            For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
                                    If rgCellChecked.Value = ComboBox1.Value Then
                                     ThisWorkbook.Worksheets("Лист1").Range("A2") = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Предприятие").DataBodyRange)
                                    End If
                        Next rgCellChecked




                 Else: ThisWorkbook.Worksheets("Лист1").Range(tagRg) = objControlChecked.Value
              End If

                ElseIf strTagArray(2) = "CombinedToRecord" Then ' запись комбинируемых значений
                    'Отдельная строка для каждого комбинируемого значения

                    If objControlChecked.Name = "ComboBox_FName" Then  'Фамилия Имя отчество
                        NameToRecord = (objControlChecked.Value & "  " & Me.Controls("ComboBox_Name").Value & "  " & Me.Controls("TextBox_OName").Value)
                        ThisWorkbook.Worksheets("Лист1").Range(tagRg).Value = NameToRecord
                     ElseIf objControlChecked.Name = "ComboBox_DataRozd_Day" Then 'Дата рождения
                       dateDateToRecord = DateSerial(Me.Controls("ComboBox_DataRozd_Year").Value, Me.Controls("ComboBox_DataRozd_Mont").Value, objControlChecked.Value)

                       ThisWorkbook.Worksheets("Лист1").Range("C19").Value = dateDateToRecord
                    End If
                      ElseIf strTagArray(2) = "CombinedNotToRecord" Then 'Перепрыгиваем эти значения
                      'Эти элементы отдельно не записываем
                      End If



              End If
    Next objControlChecked
    '//////////////////////////////////////////////////
    Dim rc As Range
    Dim bRow As Boolean
    'bRow = (MsgBox("Изменять высоту строк?", vbQuestion + vbYesNo, "www.excel-vba.ru") = vbYes)
    bRow = True  'для изменения высоты строк
    'bRow = False: для изменения ширины столбцов
    Application.ScreenUpdating = False
        ThisWorkbook.Worksheets("Лист1").Activate
        ThisWorkbook.Worksheets("Лист1").Range("B28:B32").Select
    For Each rc In Selection
        RowColHeightForContent rc, bRow
    Next
    Application.ScreenUpdating = True
    '//////////////////////////////////////////////////////

        CreateData = Now()
        ThisWorkbook.Worksheets("Лист1").Range("B40").Value = CreateData

'        ThisWorkbook.Worksheets("Лист1").Range("O1").Value = CreateData
'        ThisWorkbook.Worksheets("Лист1").Range("O1") = Format(Now, "yymmddhhmm")
    '////////////////////////////////////////////////////////////

    'Call MagzineRecord

    '////////////////////////////////////////////////////////////
    On Error Resume Next

        Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables") 'Наименование подпапки
                            For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
                                    If rgCellChecked.Value = ComboBox1.Value Then
                                     firm = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("Пр. мин").DataBodyRange)
                                     firmMag = Intersect(rgCellChecked.EntireRow, listobjTables.ListColumns("firmMag").DataBodyRange)
                                    End If
                        Next rgCellChecked

        '/////////////////////////////////////////////////////////////////
                Dim RangEd As Range                  'Изменяем цвет текста
        ThisWorkbook.Worksheets("Лист1").Activate
            'RangEd = ActiveSheet.Range("A1:P40").Select
            'RangEd.Font.Color = RGB(200, 150, 250)
                Range("A1:P40").Font.Color = 0

        '////////////////////////////////////////////////////////////////

    ' название подпапки, в которую по-умолчанию будет предложено сохранить файл
    Const REPORTS_FOLDER = "Направления\"

    REPORTS_UnFOLDER = firm
    ' создаём папку для файла, если её ещё нет
    MkDir ThisWorkbook.Path & "\" & REPORTS_FOLDER
    MkDir ThisWorkbook.Path & "\" & REPORTS_FOLDER & REPORTS_UnFOLDER & "\"
    ' выбираем стартовую папку
    ChDrive Left(ThisWorkbook.Path, 1): ChDir ThisWorkbook.Path & "\" & REPORTS_FOLDER & REPORTS_UnFOLDER & "\"

    ' вывод диалогового окна для запроса имени сохраняемого файла
    NumDat.Value = Now()
    NumDat = Format(Now, "yyyy.mm.dd.hh.nn")
'        NumDat = 12457836
    FName = ComboBox_FName.Value
    LastName = FName & " " & NumDat & ".xls"
    Filename = Application.GetSaveAsFilename(LastName, "Отчёты Excel (*.xls),", , _
                                             "Введите имя файла для сохраняемого отчёта", "Сохранить")
    ' если пользователь отказался от выбора имени файла - отменяем сохранение листа в файл
    If VarType(Filename) = vbBoolean Then Exit Sub

    ' копируем активный лист (при этом создаётся новая книга)
    Err.Clear: ActiveSheet.Copy: DoEvents
    If Err Then Exit Sub    ' произошла какая-то ошибка при попытке копирования листа

    ' убеждаемся, что активной книгой является копия листа
    If ActiveWorkbook.Worksheets.Count = 1 And ActiveWorkbook.Path = "" Then
        ' сохраняем файл под заданным именем в формате Excel 2003
        ActiveWorkbook.SaveAs Filename, xlWorkbookNormal

        ' выводим файл  на печать
'        ActiveSheet.PrintOut From:=1, To:=1

        ' закрываем сохранённый файл
        ' (удалите следующую строку, если закрывать созданный файл не требуется)
         ActiveWorkbook.Close False

    End If


    '///////////////////////////////////////////////////////////
         Call FinishVar


End Sub




Private Sub CommandButton2_Click()
    Unload Me
End Sub







Private Sub UserForm_Initialize()
    Dim objControlChecked As Object
    Dim lngCounter As Long
    Dim rgCellChecked As Range
    Dim listobjTables As ListObject
    Dim listRowTables As ListRow
'//////////////////////////////////////////////////////////////////////////
'CreateData = Now()
'///////////////////////////////////////////////////////////////////////////
Set listobjTables = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")
  'MsgBox listobjTables
    For Each rgCellChecked In listobjTables.ListColumns("Фамилия").DataBodyRange
        Me.ComboBox_FName.AddItem rgCellChecked.Value
    Next rgCellChecked
'////////////////////////////////////////////////////////////////////////////


    
    For Each objControlChecked In Me.Controls
        If Right(objControlChecked.Name, 3) = "Day" And TypeName(objControlChecked) = "ComboBox" Then
            For lngCounter = 1 To 31
                objControlChecked.AddItem lngCounter
            Next lngCounter
        End If
        If Right(objControlChecked.Name, 4) = "Mont" And TypeName(objControlChecked) = "ComboBox" Then
            For lngCounter = 1 To 12
                objControlChecked.AddItem lngCounter
            Next lngCounter
        End If
    Next objControlChecked

            For lngCounter = -16 To -70 Step -1
                Me.ComboBox_DataRozd_Year.AddItem Year(Date) + lngCounter
            Next lngCounter
   
'    Dim rgCellChecked As Range
    'Dim listobjTables As ListObject


Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("RequisitesTables")

    For Each rgCellChecked In listobjTables.ListColumns("Пр.").DataBodyRange
        Me.ComboBox1.AddItem rgCellChecked.Value
    Next rgCellChecked
    
Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("Harmful_factors_Tab")
    For Each rgCellChecked In listobjTables.ListColumns("Профессия").DataBodyRange
        Me.ComboBox_Prof.AddItem rgCellChecked.Value
    Next rgCellChecked
    
Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("Prof_Tabs")
    For Each rgCellChecked In listobjTables.ListColumns("Профессия ПО").DataBodyRange
        Me.ComboBox_Prof_PO.AddItem rgCellChecked.Value
    Next rgCellChecked
    
Set listobjTables = ThisWorkbook.Worksheets("Data").ListObjects("authorized_Tables")
    For Each rgCellChecked In listobjTables.ListColumns("Фамилия И.О.").DataBodyRange
        Me.ComboBox2.AddItem rgCellChecked.Value
    Next rgCellChecked
    
End Sub

Sub refilingNames(ByVal strNameSelected As String)
    Dim rgCellChecked As Range
    Dim listobjNameList As ListObject
    
    Set listobjNameList = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")
        'Очищаем комбобокс 2
     Me.ComboBox_Name.Clear
            'Заполняем комбобокс значениями.
    For Each rgCellChecked In listobjNameList.ListColumns("Фамилия").DataBodyRange
        If rgCellChecked.Value = strNameSelected Then
            Me.ComboBox_Name.AddItem Intersect(rgCellChecked.EntireRow, listobjNameList.ListColumns("Имя").DataBodyRange)
        End If
    Next rgCellChecked


End Sub

Sub refilingOt(ByVal strNameSelected As String, ByVal strName2Selected As String)
    Dim rgCellChecked As Range
    Dim listobjOtList As ListObject
    
    Set listobjOtList = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")
        'Очищаем текст бокс
     Me.TextBox_OName = ""
     Me.ComboBox_Prof = ""
     Me.ComboBox_DataRozd_Day = ""
     Me.ComboBox_DataRozd_Mont = ""
     Me.ComboBox_DataRozd_Year = ""
     Me.ComboBox1 = ""
     Me.TextBox6 = ""
     Me.TextBox7 = ""
        'Заполняем комбобокс значениями.
    For Each rgCellChecked In listobjOtList.ListColumns("Фамилия").DataBodyRange
            If rgCellChecked.Value = strNameSelected Then
                If rgCellChecked.Offset(0, 1).Value = strName2Selected Then
                Me.TextBox_OName = rgCellChecked.Offset(0, 2).Value
                Me.ComboBox_Prof = rgCellChecked.Offset(0, 3).Value
                Me.ComboBox_Prof_PO = rgCellChecked.Offset(0, 3).Value
                DataRozd = rgCellChecked.Offset(0, 4).Value
                Me.ComboBox1 = rgCellChecked.Offset(0, 5).Value
                Me.TextBox6 = rgCellChecked.Offset(0, 6).Value
                Me.TextBox7 = rgCellChecked.Offset(0, 7).Value
                Me.TextBoxAdres = rgCellChecked.Offset(0, 8).Value
'                MsgBox "День: " & DatePart("d", DataRozd)
'                MsgBox "Месяць: " & DatePart("m", DataRozd)
'                MsgBox "Год: " & DatePart("yyyy", DataRozd)
                DataRozdDay = DatePart("d", DataRozd)
                DataRozdMont = DatePart("m", DataRozd)
                DataRozdYear = DatePart("yyyy", DataRozd)
                'DataRozd = Format(rgCellChecked.Offset(0, 4), "dd.mm.yyyy")
                Me.ComboBox_DataRozd_Day = DataRozdDay
                Me.ComboBox_DataRozd_Mont = DataRozdMont
                Me.ComboBox_DataRozd_Year = DataRozdYear
                'DataRozd.Format ("dd.mm.yyyy")
                End If
            End If
    Next rgCellChecked


End Sub

Private Sub CommandButton_Record_Click()
Dim strTagArray() As String
Dim objControlChecked As Object
Dim dateDateToRecord As Date
Dim rgCellChecked As Range
Dim listobjNameList As ListObject
        'Система тэгов
        ' 1 Наименование столбца таблицы
        ' 2 Цельное или сборное значение
        ' 3 обязательное или нет поле

        'Проверка наличия аналогичной записи

Set listobjNameList = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")

            'Проверяем наличие дубликатов
    For Each rgCellChecked In listobjNameList.ListColumns("Фамилия").DataBodyRange
        If rgCellChecked.Value = ComboBox_FName Then
            If rgCellChecked.Offset(0, 1).Value = ComboBox_Name Then
                If rgCellChecked.Offset(0, 2).Value = TextBox_OName Then
            'MsgBox "Данная запись уже существует. Ввод приведёт к задвоению данных"
            Call CreateDokument
                   Exit Sub
                End If
            End If
        End If
    Next rgCellChecked

       'Проверка полноты данных
       For Each objControlChecked In Me.Controls
        If objControlChecked.Tag <> "" Then
            strTagArray = Split(objControlChecked.Tag, "_")
            If strTagArray(5) = "Y" And objControlChecked.Visible = True Then
                If objControlChecked.Value = "" Then
                    MsgBox "заполните все обязательные поля", vbExclamation
                    Exit Sub
                End If
            End If
        End If
    Next objControlChecked

        '//////////////////////////////////////////////////////////
Dim listobjOrderList As ListObject
    Set listobjOrderList = ThisWorkbook.Worksheets("Person").ListObjects("FIO_Table")
    Dim rgNewOrderLine As Range
    listobjOrderList.ListRows.Add
    Set rgNewOrderLine = listobjOrderList.ListRows(listobjOrderList.ListRows.Count).Range


    For Each objControlChecked In Me.Controls
        If objControlChecked.Tag <> "" Then
            strTagArray = Split(objControlChecked.Tag, "_")
           'MsgBox strTagArray(4)
              If strTagArray(4) = "RecordToTable" Then   'запись целых значений
            Intersect(rgNewOrderLine, listobjOrderList.ListColumns(strTagArray(3)).DataBodyRange) = objControlChecked.Value
                ElseIf strTagArray(4) = "CombinedRecordToTable" Then ' запись комбинируемых значений
                    'Отдельная строка для каждого комбинируемого значения
                     If objControlChecked.Name = "ComboBox_DataRozd_Day" Then 'Дата рождения
                    dateDateToRecord = DateSerial(Me.Controls("ComboBox_DataRozd_Year").Value, Me.Controls("ComboBox_DataRozd_Mont").Value, objControlChecked.Value)
                    'MsgBox dateDateToRecord
                   ' MsgBox (Round(CDbl(dateDateToRecord), 0))
                   ' MsgBox strTagArray(0)
                  Intersect(rgNewOrderLine, listobjOrderList.ListColumns(strTagArray(3)).DataBodyRange) = CDbl(dateDateToRecord)
                     End If
                   ElseIf strTagArray(4) = "CombinedNotRecordToTable" Then 'Перепрыгиваем комбинируемые, обрабатываемые в связке элементы управления
                'Эти элементы управления отдельно не записываются!
                  End If

        End If
    Next objControlChecked

    If MsgBox("Создать направление?", vbYesNo + vbInformation, "Внимание") = vbYes Then
        Call CreateDokument
        Else: Call CloseSheet
        'Call CloseSheet
        End If


'    Call CommandButton1_Click
End Sub

