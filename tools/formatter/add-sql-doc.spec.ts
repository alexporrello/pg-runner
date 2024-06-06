import { extractDocParts, findNextCreateTable } from './add-sql-doc';

const sqlStr = `	CONSTRAINT fk_pib_project
		FOREIGN key (project)
		REFERENCES project.business ("name")
		MATCH SIMPLE
		ON UPDATE CASCADE
		ON DELETE NO ACTION
) WITH (oids = false);

CREATE TABLE IF NOT EXISTS forecast.pib_map (
	gp_code CHARACTER VARYING COLLATE pg_catalog."default" NOT NULL,
	project_name CHARACTER VARYING COLLATE pg_catalog."default",
	CONSTRAINT pk_pib_gp_code
		PRIMARY key (gp_code),
	CONSTRAINT fk_name
		FOREIGN key (project_name)
		REFERENCES project.business (name)
		MATCH SIMPLE
		ON UPDATE cascade
		ON DELETE no action
) WITH (oids = FALSE);

CREATE TABLE IF NOT EXISTS forecast.etc_map (
	gp_code CHARACTER VARYING COLLATE pg_catalog."default" NOT NULL,
	project_name CHARACTER VARYING COLLATE pg_catalog."default",
	CONSTRAINT pk_etc_gp_code
		PRIMARY key (gp_code)),
	CONSTRAINT fk_name
		FOREIGN key (project_name)
		REFERENCES project.business (name)
		MATCH SIMPLE
		ON UPDATE cascade
		ON DELETE no action
		WITH (oids = FALSE);
END;`;

const createTable = findNextCreateTable(sqlStr, 0);
if (createTable) {
    const params = extractDocParts(createTable);
    console.log(params);
}
