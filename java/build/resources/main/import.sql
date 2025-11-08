-- This file allow to write SQL commands that will be emitted in test and dev.
-- The commands are commented as their support depends of the database
-- insert into myentity (id, field) values(1, 'field-1');
-- insert into myentity (id, field) values(2, 'field-2');
-- insert into myentity (id, field) values(3, 'field-3');
-- alter sequence myentity_seq restart with 4;

insert into user_profile (email, name, description, payment_pointer) values ('test@test.com', 'test', 'unit test profile', 'pointing');

insert into payment (id, amount, currency) values ('22138913-7bab-4255-8ea2-739355174c3b', '24.99', 'USD');