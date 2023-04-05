from datetime import datetime
import psycopg2

import string
import random
import pytz

import json

connection = psycopg2.connect(
    user="postgres",
    password="1muhammad1",
    host="167.99.250.232",
    port="5432",
    database="postgres")

CHARACTERS = (
    string.ascii_letters
    + string.digits
)
def generate_unique_key():
    return ''.join(random.sample(CHARACTERS, 32))

def store_cookie_return_sessionid(cookie): 

    cookie = json.dumps(cookie)
  
    timeZone = pytz.timezone("EST") 
    date_time = datetime.now(timeZone)

    try:
        session_id = generate_unique_key()
        cursor = connection.cursor()

        insert_query = """ INSERT INTO socialmedia.user_sessions(session_id, cookie, date_time) VALUES (%s, %s, %s); """
        record_to_insert = (session_id, cookie, date_time)
        cursor.execute(insert_query, record_to_insert)
        connection.commit()
        print("Record inserted in user_sessions successfully")

        return session_id
    
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return False

def get_cookie_from_user_sessions(session_id):

    try:
        cursor = connection.cursor()
        
        t = (session_id,)
        cursor.execute("SELECT cookie FROM socialmedia.user_sessions WHERE session_id=%s", t)
        cookie_dict = cursor.fetchone()
        if cookie_dict:
            # print(type(cookie_dict)) # type is str, json.loads converts it back to a dict
            return json.loads(cookie_dict[0])
        else:
            return False
        
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return False

def store_leads(lead_list):
    try:
        cursor = connection.cursor()
        for lead_info in lead_list:
            t = ((lead_info[0], lead_info[1], lead_info[2], lead_info[3]),)
            cursor.execute("INSERT INTO socialmedia.leads(lead_name, title, current_company, location) VALUES %s", t)
        connection.commit()
        print("All records inserted successfully")
        return True
    
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return False
        
def search_leads(lead_name, title, current_company, location):

    try:
        cursor = connection.cursor()
        t = (f'%{lead_name}%', f'%{title}%', f'%{current_company}%', f'%{location}%')
        cursor.execute("SELECT lead_name, title, current_company, location FROM socialmedia.leads WHERE lead_name LIKE %s \
                       AND title LIKE %s \
                       AND current_company LIKE %s \
                       AND location LIKE %s", t) # type: ignore
        result = cursor.fetchone()
        print(result[0])
        if result:
            return result[0] 
        else:
            return False
            
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return False
