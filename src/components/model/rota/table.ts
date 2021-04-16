import Excel from "exceljs";
import {Duty, Employee, Preferences, Roster, Shift, Task, TaskCounts, Team} from "../domain";
import {Document} from "./document";
import {PrefsRecord, ShiftRecord} from "./record";
import {PrefsColumns, ShiftColumns} from "./columns";

export class ShiftTable {
  document: Document;
  sheetName: string;
  records: ShiftRecord[] = [];
  priorTableCount = 0;

  private _employees: Employee[] | undefined;
  private _tasks: Task[] | undefined;

  constructor(document: Document, sheet: Excel.Worksheet) {
    this.document = document;
    this.sheetName = sheet.name;
    const columns = new ShiftColumns();
    sheet.eachRow(row => {
      const teamName = row.getCell(columns.team).text;
      if (Team.exists(teamName)) {
        this.records.push(new ShiftRecord(document.themeColors, columns, row));
      }
    });
  }

  get employees(): Employee[] {
    if (this._employees === undefined) {
      const recentTables = this.document.tablesPreceding(this.sheetName);
      this._employees = this.records
        .flatMap(record => {
          const name = record.name;
          const preferences = this.document.preferences(name);
          if (preferences.areAllNo()) return [];
          const counts = this.shiftAndTaskCounts(recentTables, name);
          return new Employee(
            name,
            record.team,
            record.statuses,
            preferences,
            counts.shiftCount,
            counts.taskCounts
          );
        })
      this.priorTableCount = recentTables.length;
    }
    return this._employees;
  }

  private shiftAndTaskCounts(tables: ShiftTable[], name: string): {shiftCount: number, taskCounts: TaskCounts} {
    return tables
      .reduce((counts: {shiftCount: number, taskCounts: TaskCounts}, table: ShiftTable) => {
        const record = table.findRecord(name);
        const shiftCount = record?.shiftsWorked ?? 0;
        const taskCounts = record?.tasksPerformed ?? new TaskCounts();
        return {shiftCount: counts.shiftCount + shiftCount, taskCounts: counts.taskCounts.add(taskCounts)};
      }, {shiftCount: 0, taskCounts: new TaskCounts()});
  }

  get tasks(): Task[] {
    if (this._tasks === undefined) {
      this._tasks = this.createTasks(this.employees);
      this.addUnassignedTasksTo(this._tasks);
    }
    return this._tasks;
  }

  set tasks(value) {
    this._tasks = value;
    this._tasks.forEach(task => {
      if (task.employee !== null) {
        this.findRecord(task.employee.name)?.enterTask(task);
      }
    });
  }

  private createTasks(employees: Employee[]): Task[] {
    const tasks: Task[][] = [];
    for (const employee of employees) {
      const record = this.findRecord(employee.name);
      if (record !== undefined) {
        tasks.push(record.createTasks(employee));
      }
    }
    return tasks.flat();
  }

  private addUnassignedTasksTo(tasks: Task[]) {
    // @ts-ignore
    for (const duty of Duty) {
      // @ts-ignore
      for (const shift of Shift) {
        const tasksRequired: number = duty.getTaskCount(shift);
        const tasksPresent = tasks.filter(task => task.duty === duty && task.shift === shift).length;
        for (let i = 0; i < tasksRequired - tasksPresent; i++) {
          tasks.push(new Task(duty, shift));
        }
      }
    }
  }

  get unassignedTaskCount(): number {
    return this.tasks.filter(task => task.employee === null).length;
  }

  applyRoster(roster: Roster) {
    this.tasks = roster.tasks;
  }

  getRecord(employee: Employee): ShiftRecord | undefined {
    return this.findRecord(employee.name);
  }

  findRecord(name: string): ShiftRecord | undefined {
    return this.records.find(record => record.name === name);
  }
}


export class PrefsTable {
  private records: PrefsRecord[] = [];

  constructor(sheet: Excel.Worksheet) {
    const columns = new PrefsColumns(sheet);
    sheet.eachRow(row => {
      const teamName = row.getCell(columns.team).text;
      if (Team.exists(teamName)) {
        this.records.push(new PrefsRecord(columns, row));
      }
    });
  }

  getPreferences(employeeName: string): Preferences {
    const record = this.records.find(record => record.name === employeeName);
    return record === undefined ? new Preferences() : record.getPreferences();
  }
}
