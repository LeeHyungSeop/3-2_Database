drop table if exists Apply;
drop table if exists Student;
drop table if exists College;

create table College(cName text, state text, enrollment int,
primary key (cName));

create table Student(sID int, sName text, GPA real, sizeHS int,
primary key(sID));

create table Apply(sID int, cName text, major text, decision text,
primary key(sID, cName, major),
foreign key (sID) references Student(sID),
foreign key (cName) references College(cName));
