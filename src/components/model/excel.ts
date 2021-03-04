import Excel, {CellValue} from "exceljs";
import {Shift, Team} from "./domain";

export class Document {
  private file: File | null = null;
  private workbook: Excel.Workbook;
  private table: Table | null = null;

  constructor() {
    this.workbook = new Excel.Workbook();
  }

  async load(file: File): Promise<string[]> {
    this.file = file;
    const buffer = await file.arrayBuffer();
    await this.workbook.xlsx.load(buffer);
    return this.workbook.worksheets.map(sheet => sheet.name);
  }

  async solve(sheetName: string): Promise<File> {
    this.table = new Table(this.workbook.getWorksheet(sheetName));

    // Simulate wait for solving
    await new Promise(resolve => setTimeout(resolve, 5000));

    const buffer = await this.workbook.xlsx.writeBuffer();
    return new File([buffer], this.file!.name, {type: this.file!.type});
  }
}

class Table {
  private recordList: Record[] = [];

  constructor(sheet: Excel.Worksheet) {
    const columns = new Columns(sheet);
    sheet.eachRow(row => {
      const teamName = row.getCell(columns.team).text;

      if (Team.exists(teamName)) {
        this.recordList.push(new Record(columns, row));
      }
    });
    console.log(this.recordList);
  }
}

class Record {
  private readonly teamField: Field;
  private readonly nameField: Field;
  private readonly shiftFields: Field[];
  private readonly fishField: Field;
  private readonly dsFields: Field[];
  private readonly lateDSFields: Field[];
  private readonly ssField: Field;

  constructor(columns: Columns, row: Excel.Row) {
    this.teamField = new TextField(row.getCell(columns.team));
    this.nameField = new TextField(row.getCell(columns.name));

    this.shiftFields = Array(Shift.enumValues.length);
    // @ts-ignore
    for (const shift of Shift) {
      this.shiftFields[shift.enumOrdinal] = new ShiftField(row.getCell(columns.shift(shift)));
    }

    this.fishField = new TextField(row.getCell(columns.fish));

    this.dsFields = Array(Shift.enumValues.length);
    // @ts-ignore
    for (const shift of Shift) {
      this.dsFields[shift.enumOrdinal] = new TextField(row.getCell(columns.ds(shift)));
    }

    this.lateDSFields = Array(Shift.enumValues.length / 2);
    // @ts-ignore
    for (const shift of Shift) {
      if (shift.enumOrdinal % 2 === 0) continue;
      this.lateDSFields[Math.trunc(shift.enumOrdinal / 2)] = new TextField(row.getCell(columns.lateDS(shift)));
    }

    this.ssField = new TextField(row.getCell(columns.ss));
  }
}

abstract class Field {
  private cell: Excel.Cell;

  constructor(cell: Excel.Cell) {
    this.cell = cell;
  }
}

class TextField extends Field {

}

class ShiftField extends Field {

}

class Columns {
  team = 1;
  name = 2;
  fish: number;
  ss: number;

  private readonly firstDSColumn: number;
  private readonly firstLateDSColumn: number;

  constructor(sheet: Excel.Worksheet) {
    this.fish = Columns.findColumn(sheet, "FISH");
    this.ss = Columns.findColumn(sheet, "SS");
    this.firstDSColumn = Columns.findColumn(sheet, "DS");
    this.firstLateDSColumn = Columns.findColumn(sheet, "Late DS");
  }

  shift(shift: Shift): number {
    return 2 + shift.enumOrdinal;
  }

  ds(shift: Shift): number {
    return this.firstDSColumn + shift.enumOrdinal;
  }

  lateDS(shift: Shift): number {
    return this.firstLateDSColumn + Math.trunc(shift.enumOrdinal / 2);
  }

  private static findColumn(sheet: Excel.Worksheet, label: string): number {
    const values = sheet.getRow(1).values as CellValue[];
    return values.findIndex(value => value === label);
  }
}