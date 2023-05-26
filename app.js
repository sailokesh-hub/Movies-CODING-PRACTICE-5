const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let database = null;
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// get the list of all the movies in the database (movies table)
// API 1
const ConvertMovieDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `select movie_name from movie;`;
  const getMoviesListQueryResponse = await database.all(getMoviesListQuery);
  response.send(
    getMoviesListQueryResponse.map((eachMovie) => ConvertMovieDbAPI1(eachMovie))
  );
});

//API 2
// create a movie in movies table in moviesData.db
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `insert into movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await database.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 3
//Returns a movie based on the movie ID
const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie where movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await database.get(getMovieDetailsQuery);
  response.send(ConvertMovieDbAPI3(getMovieDetailsQueryResponse));
});

//API 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  await database.run(createMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const createMovieQuery = `delete from movie where movie_id = ${movieId};`;
  await database.run(createMovieQuery);
  response.send("Movie Removed");
});

//API 6

const convertDbObjectApi6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getMoviesListQuery = `select director_id, director_name from director;`;
  const getMoviesListQueryResponse = await database.all(getMoviesListQuery);
  response.send(
    getMoviesListQueryResponse.map((eachMovie) =>
      convertDbObjectApi6(eachMovie)
    )
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesListQuery = `select movie_name as movieName from movie where director_id = ${directorId};`;
  const getMoviesListQueryResponse = await database.all(getMoviesListQuery);
  response.send(getMoviesListQueryResponse);
});

module.exports = app;
