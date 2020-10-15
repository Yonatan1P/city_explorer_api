DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR,
    formatted_query VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC
)
