# Style guidelines:
# cookie, not cookies
# LinkedIn, not Linkedin

# TODO: Move from print to logging
import time
import os
import sys
import logging
import pickle
import re
import asyncio
import json

from linkedin_api import Linkedin

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# from bertopic import BERTopic
import emoji

from rq import Queue
from worker import conn

import openai
from EdgeGPT import Chatbot

# import dbCon

import urllib.parse

q = Queue(connection=conn)

app = Flask(__name__)

# Enables CORS (this is only needed when working with React.js, I don't know why)
CORS(app, resources={r"/*": {"origins": "*"}})

async def UseBingAI(prompt):
    
    # This is getting my own bing cookies
    bot = Chatbot(cookiePath='./cookie.json')

    ans_json = await bot.ask(prompt=prompt)
    ans = ans_json['item']['messages'][1]['text']
    
    await bot.close()
    return ans

def UseChatGPT(prompt):

    # TODO: Check usage in the conversation, if token limit is near, start a new conversation
    
    openai_key = "sk-BQ0tK7GxoNDv0zYjTkT1T3BlbkFJ2TAJQSSJ4UEYSrDPn68"
    openai_key = openai_key + "7"
    openai.api_key = openai_key

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0301",
        messages = [
            {"role": "user", "content": prompt}
        ]
    )
    
    print(completion['choices'][0]['message']['content'])
    
    return completion['choices'][0]['message']['content']

def get_values_for_key(key, dictionary):
    values = []
    for k, v in dictionary.items():
        if k == key:
            values.append(v)
        elif isinstance(v, dict):
            values.extend(get_values_for_key(key, v))
    return values    

# Used only for save-cookie
def cookies_list_to_cookie_dict(cookies_list):
    cookie_dict = {}
    for single_dict in cookies_list:
        temp = single_dict["value"].strip('"')
        cookie_dict[single_dict["name"]] = temp
    return cookie_dict    

# def GenerateCorpus(api, profile):
    
    # convos = api.get_profile_posts(profile, post_count = 100)
    
    # post_corpus = []
    # for post in convos:
        # person_corpus = get_values_for_key("text", post)
        # # print("ii", person_corpus)
        # person_corpus = [item for item in person_corpus if isinstance(item, dict)]
        # # print("jj",person_corpus)

        # try:
            # if len(person_corpus) == 1:
                # person_corpus = get_values_for_key("text", person_corpus[0])
            # else:
                # person_corpus = get_values_for_key("text", person_corpus[1])
            
            # person_corpus = emoji.demojize(person_corpus)
            # # print("dd", person_corpus)
            # post_corpus.append(person_corpus)
        # except:
            # pass
    
    # print("post_corpus", post_corpus)
    # return post_corpus
        
# def ModelAndReturnTopicList(api, profile_id):
    
    # post_corpus = GenerateCorpus(api, profile_id)
    
    # topic_model = BERTopic(min_topic_size=10, verbose=True)
    # topics, _ = topic_model.fit_transform(post_corpus)
    # freq = topic_model.get_topic_info()
    # print(freq)
    # print(freq.head(10))
    # print(topic_model.get_topic(1))
    
    # # For now, let us send n if there are n or -1 if there are none
    # # Need to see how can we send all? Maybe the best ones from a group
    # final_topics = []
    # if len(topic_model.get_topics()) == 1:
        # for tup in topic_model.get_topic(-1):
            # final_topics.append(tup[0])
    # else:
        # for topic in topic_model.get_topics():
            # if topic != -1:
                # for tup in topic_model.get_topic(topic):
                    # final_topics.append(tup[0])
    # print(final_topics)
    
    # return final_topics

def GetProfile(cookie_dict, search_params, location, mutual_connections_boolean):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    list_of_people = api.search_people(keyword_title = search_params['title'],
                                        regions = [location if location != '' else ''],
                                        keyword_company = search_params['currentCompany'],
                                        network_depth = "S" if mutual_connections_boolean == True else "O",
                                        limit=5)
    
    print(list_of_people)
    
    full_profile_list = []

    for person in list_of_people[0:5]:
        profile_info = {}
        profile_info['full_name'] = person['name']
        profile_info['latest_title'] = person['jobtitle']       
        profile_info['public_id'] = person['public_id']
        profile_info['profile_urn'] = person['urn_id']
        profile_info['profile_id'] = person['profile_id']
       
        full_profile_list.append(profile_info)

    # for person in list_of_people[0:5]:
    #     prof = api.get_profile(person['public_id'])       
    #     prof_skills = api.get_profile_skills(person['public_id'])
    #     prof['skills'] = prof_skills
    #     prof['public_id'] = person['public_id']
    #     prof['profile_urn'] = person['urn_id']
    #     full_profile_list.append(prof)

    return full_profile_list
    
def GetGeoUrn(api, location):

    res = api._fetch(f"/typeahead/hitsV2?keywords={location}&origin=OTHER&q=type&queryContext=List(geoVersion-%3E3,bingGeoSubTypeFilters-%3EMARKET_AREA%7CCOUNTRY_REGION%7CADMIN_DIVISION_1%7CCITY)&type=GEO")

    geo_urn = res.json()['elements'][0]['targetUrn'] # Output: urn:li:fs_geo:103644278
    geo_urn = re.search("\d+", geo_urn).group()
    return geo_urn

def GetConversationThreads(api):
        
    convo_list=[]
    convos = api.get_conversations()

    for thread_idx in range(0, len(convos)):
        first_name = get_values_for_key('firstName', convos['elements'][thread_idx]['participants'][0])
        last_name = get_values_for_key('lastName', convos['elements'][thread_idx]['participants'][0])
        full_name = first_name[0] + " " + last_name[0]
        
        profile_urn = get_values_for_key('dashEntityUrn', convos['elements'][thread_idx]['participants'][0])
        
        regex = r"profile:(.+)"
        match = re.search(regex, profile_urn[0])
        if match:
            result = match.group(1)
            convo_list.append([full_name, result])
                    
    return convo_list

def GetConversationMessages(cookie_dict, conversation_id):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore

    convo_list=[]
    convo = api.get_conversation_details(conversation_id)
        
    for message_idx in range(0, len(convo['events'])):
        cleaned_up_convo = get_values_for_key('text',convo['events'][message_idx])
        convo_list.append(cleaned_up_convo)
            
    return convo_list
    
def GetPeopleInterests(cookie_dict, profile_urn):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    print(profile_urn)

    person_interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
    person_interests = person_interests.json()
    person_interests_json = json.dumps(person_interests)

    # ============= Getting interests of People =============================
    pattern = re.compile(r'"(urn:li:fsd_profile:[^"]*)"')
    matches = re.findall(pattern, person_interests_json)

    people_the_profile_is_interested_in_set = set(matches)
    people_the_profile_is_interested_in = [s.split(':')[-1] for s in people_the_profile_is_interested_in_set]

    print(people_the_profile_is_interested_in)

    # Get the profile urn, get the name and store in another list
    final_people_the_profile_is_interested_in = []
    for profile_urn in people_the_profile_is_interested_in:
    
        temp = api.get_profile(profile_urn)
        first_name = temp['firstName']
        last_name = temp['lastName']
        full_name = first_name + " " + last_name 
        final_people_the_profile_is_interested_in.append([full_name, profile_urn])

    print(final_people_the_profile_is_interested_in)
    print(len(final_people_the_profile_is_interested_in))
    # ============= Getting interests of People =============================
    
    return final_people_the_profile_is_interested_in
    
def GetCompanyInterests(cookie_dict, public_id, profile_urn):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    person_interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
    person_interests = person_interests.json()
    person_interests_json = json.dumps(person_interests)
    
    # ============= Getting first 20 interests of Companies =============================
    pattern_for_company = re.compile(r'"(urn:li:fsd_company:[^"]*)"')
    matches_for_company = re.findall(pattern_for_company, person_interests_json)
    
    companies_the_profile_is_interested_in_set = set(matches_for_company)
    companies_the_profile_is_interested_in = [s.split(':')[-1] for s in companies_the_profile_is_interested_in_set]
    
    # get the profile urn, get the name and store in another list
    final_companies_the_profile_is_interested_in = []
    for company_id in companies_the_profile_is_interested_in:
        temp = api.get_company(company_id)
        company_name = temp['universalName']
        final_companies_the_profile_is_interested_in.append([company_name, company_id])

    print(final_companies_the_profile_is_interested_in)
    print(len(final_companies_the_profile_is_interested_in))
    # ============= Getting first 20 interests of Companies =============================
    
    return final_companies_the_profile_is_interested_in
    

# ================================================ ROUTES START =============================================
@app.route('/use-bingai', methods=['POST'])
def use_bingai():

    prompt = request.json['prompt'] # type: ignore    
    data = q.enqueue(UseBingAI, prompt)
    job_id = data.get_id()

    return jsonify(success=True, message=job_id)

@app.route('/use-chatgpt', methods=['POST'])
def use_chatgpt():

    prompt = request.json['prompt'] # type: ignore   
    ans = UseChatGPT(prompt)
    
    return jsonify(success=True, message=ans)

@app.route('/receive-link', methods=['POST'])
def receive_link():
    
    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore

    search_params = request.json
    location = request.json['location'] # type: ignore
    mutual_connections_boolean = request.json['mutualConnections'] # type: ignore

    title: str = request.json['title'] # type: ignore
    currentCompany: str = request.json['currentCompany'] # type: ignore
    # dbCon.getSearchParams(title, location, currentcompany=currentCompany)
    
    if location != '':
        location_geo_urn = GetGeoUrn(api, location)
        data = q.enqueue(GetProfile, cookie_dict, search_params, location_geo_urn, mutual_connections_boolean)

    else:
        data = q.enqueue(GetProfile, cookie_dict, search_params, '', mutual_connections_boolean)
            
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)
    
# @app.route('/get-interests', methods=['POST'])
# def get_interests():

    # email = request.json['email']
    # password = request.json['password']
    # api = Linkedin(email, password)

    # public_id = request.json
    # # print("get_interests", public_id['publicId'])
    # data = ModelAndReturnTopicList(api, public_id['publicId'])
    # # print(data)
    
    # return jsonify(success=True, message=data)

@app.route('/job-status', methods=['POST'])
def job_status():

    job_id = request.json['jobId'] # type: ignore
    job = q.fetch_job(job_id)
    job_status = job.get_status() # type: ignore
    result = job.result # type: ignore
    
    return jsonify(success=True, status=job_status, result=result)

@app.route('/get-people-interests', methods=['POST'])
def get_people_interests():
    
    cookie_dict = request.json['cookie'] # type: ignore
    profile_urn = request.json['profileUrn'] # type: ignore
    
    data = q.enqueue(GetPeopleInterests, cookie_dict, profile_urn)
    
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)

@app.route('/get-company-interests', methods=['POST'])
def get_company_interests():
    
    cookie_dict = request.json['cookie'] # type: ignore
    public_id = request.json
    profile_urn = request.json['profileUrn'] # type: ignore

    data = q.enqueue(GetCompanyInterests, cookie_dict, public_id, profile_urn)
    
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)
     
@app.route('/get-convo-threads', methods=['POST'])
def get_convo_threads():

    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    data = GetConversationThreads(api)
    
    return jsonify(success=True, message=data)

@app.route('/get-convo-messages', methods=['POST'])
def get_convo_messages():
    
    cookie_dict = request.json['cookie'] # type: ignore
    profile_urn = request.json['profileUrn'] # type: ignore
    
    data = GetConversationMessages(cookie_dict, profile_urn)
   
    return jsonify(success=True, message=data)

@app.route('/send-connect', methods=['POST'])
def send_connect():

    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore

    profile_id = request.json['profileId']
    text = request.json['text']
    
    error_boolean = api.add_connection(profile_id, text)
    return jsonify(success=True, message=error_boolean)

@app.route('/send-message', methods=['POST'])
def send_message():
    
    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore

    profile_id = request.json['profileId']
    text = request.json['text']
    data = api.send_message(message_body = text, recipients=[profile_id])

    return jsonify(success=True, message='sent message')

@app.route('/save-cookie', methods=['POST'])
def save_cookie():
    
    cookies_list = request.json['cookie'] # type: ignore  
    cookie_dict = cookies_list_to_cookie_dict(cookies_list)
    api = Linkedin(cookies=cookie_dict) # type: ignore

    url_encoded_cookie = urllib.parse.urlencode(cookie_dict) 
    print(url_encoded_cookie)   

    # Instead of the 2 lines above, save the cookie_dict and generate a session_id for the user
    # Return the session_id, this will go to the database and get the cookie_dict

    return jsonify(success=True, message="success", cookie=url_encoded_cookie)
# ================================================ ROUTES END =============================================