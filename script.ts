import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

const csvFilePath = path.resolve(
  __dirname,
  "time_series_covid19_deaths_US.csv"
);

const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

parse(
  fileContent,
  {
    delimiter: ",",
    columns: true,
  },
  (error, result: any[]) => {
    if (error) {
      console.error(error);
      return;
    }
    const columns: string[] = Object.keys(result[0]);
    const lastDate: string = columns[columns.length - 1];

    const deathByStates: Record<string, number> = result.reduce(
      (acc: Record<string, number>, curr: Record<string, number>) => {
        const previousState: number = acc[curr.Province_State] ?? 0;
        return {
          ...acc,
          [curr.Province_State]: +previousState + +curr[lastDate],
        };
      },
      {} as Record<string, number>
    );

    const sortedDeathByState: [string, number][] = Object.entries(
      deathByStates
    ).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);

    //1. Estado con mayor acumulado a la fecha
    const maxStateDeath: [string, number] = sortedDeathByState[0];
    console.log(
      `1. Estado con mayor acumulado a la fecha: ${maxStateDeath[0]} con ${maxStateDeath[1]} muertes`
    );
    console.log(
      `Fue ${maxStateDeath[0]} ya que al organizar los datos por acumulado de muertes, fue el estado que tenia mayor acumulado a la fecha`
    );
    console.log(
      "-------------------------------------------------------------------------\n"
    );

    //2. Estado con menor acumulado a la fecha
    const minStateDeath: [string, number] =
      sortedDeathByState[sortedDeathByState.length - 1];
    console.log(
      `2. Estado con menor acumulado a la fecha: ${minStateDeath[0]} con ${minStateDeath[1]} muertes`
    );
    console.log(
      `Fue ${minStateDeath[0]} ya que al organizar los datos por acumulado de muertes, fue el estado que tenia menor acumulado a la fecha`
    );
    console.log(
      "-------------------------------------------------------------------------\n"
    );

    // 3. El porcentaje de muertes vs el total de población por estado
    const populationByState: Record<string, number> = result.reduce(
      (acc: Record<string, number>, curr: Record<string, number>) => {
        let previousState: number = acc[curr.Province_State] ?? 0;
        return {
          ...acc,
          [curr.Province_State]: +previousState + +curr.Population,
        };
      },
      {} as Record<string, number>
    );

    const percentage: Record<string, number>[] = Object.keys(
      populationByState
    ).map((state: string) => {
      const population: number = populationByState[state];
      const death: number = deathByStates[state];
      return {
        [state]: population === 0 ? 0 : (death * 100) / population,
      };
    });
    console.log(
      "3. El porcentaje de muertes vs el total de población por estado es: ",
      percentage
    );
    console.log(
      "Se calcula la población de cada estado y luego se calcula el porcentaje con la información de muertes \n" +
        "usando el numero de muertes por 100 dividido por la población de cada estado"
    );
    console.log(
      "-------------------------------------------------------------------------\n"
    );
  }
);
