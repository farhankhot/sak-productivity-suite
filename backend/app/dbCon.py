import datetime

import psycopg2



def getSearchParams(title, location, currentcompany): 

    userid = "admin@admin.com"
    cookie = "Null"
    mutualconnections = "Null"
    data_time = datetime.datetime.now()
    
    try:
        connection = psycopg2.connect(user="postgres",
                                password="1muhammad1",
                                host="167.99.250.232",
                                port="5432",
                                database="postgres")
        # userid, cookie, title, location, currentcompany, mutualconnections
        cursor = connection.cursor()
        # Executing a SQL query to insert datetime into table
        insert_query = """ INSERT INTO socialmedia.searchparams(userid, cookie, title, location, currentcompany, mutualconnections, data_time)VALUES (%s, %s, %s, %s, %s, %s, %s); """
        
        cursor.execute(insert_query, userid, cookie, title, location, currentcompany, mutualconnections, data_time)
        connection.commit()
        print("Record inserted successfully")

        return True 

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)

        return False

    finally:
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

