# Style guidelines:
# cookie, not cookies
# LinkedIn, not Linkedin

# TODO: Move from print to logging
import logging
import re
import asyncio
import json

from linkedin_api import Linkedin

from flask import Flask, request, jsonify
from flask_cors import CORS

# from bertopic import BERTopic
import emoji

from rq import Queue
from worker import conn

import openai
from EdgeGPT import Chatbot

import dbCon

import requests

q = Queue(connection=conn)

app = Flask(
    __name__,
    static_url_path='',
    static_folder="client/build")

# Enables CORS (this is only needed when working with React.js, I don't know why)
CORS(app, resources={r"/*": {"origins": "*"}})

async def UseBingAI(prompt):
    
    # This is getting my own bing cookies
    bot = Chatbot(cookiePath='./cookie.json')

    ans_json = await bot.ask(prompt=prompt)
    ans = ans_json['item']['messages'][1]['text']
    
    await bot.close()
    return ans

# TODO: Check context length usage in the conversation, if token limit is near, start a new conversation
def UseChatGPT(prompt):

    openai_key = "sk-BFk5W7jx2pZjz0Y1vhsjT3BlbkFJRXRp7HrXqrAZoVgnri8"
    openai_key = openai_key + "T"
    openai.api_key = openai_key

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0301",
        messages = [
            {"role": "user", "content": prompt}
        ]
    )
    
    # print(completion['choices'][0]['message']['content']) # type: ignore
    
    return completion['choices'][0]['message']['content'] # type: ignore

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
    
    # print(list_of_people)
    
    full_profile_list = []

    for person in list_of_people[0:5]:
        profile_info = {}
        profile_info['full_name'] = person['name']
        profile_info['latest_title'] = person['jobtitle']       
        profile_info['public_id'] = person['public_id']
        profile_info['profile_urn'] = person['urn_id']
        # profile_info['profile_id'] = person['profile_id']
       
        full_profile_list.append(profile_info)

    return full_profile_list
    
def GetGeoUrn(api, location):

    res = api._fetch(f"/typeahead/hitsV2?keywords={location}&origin=OTHER&q=type&queryContext=List(geoVersion-%3E3,bingGeoSubTypeFilters-%3EMARKET_AREA%7CCOUNTRY_REGION%7CADMIN_DIVISION_1%7CCITY)&type=GEO")

    geo_urn = res.json()['elements'][0]['targetUrn'] # Output: urn:li:fs_geo:103644278
    geo_urn = re.search("\d+", geo_urn).group() # type: ignore
    return geo_urn

def GetConversationThreads(api):
        
    convo_list=[]
    convos = api.get_conversations()
    # print(convos)

    for thread_idx in range(0, len(convos)):
        first_name = get_values_for_key('firstName', convos['elements'][thread_idx]['participants'][0])
        last_name = get_values_for_key('lastName', convos['elements'][thread_idx]['participants'][0])
        full_name = first_name[0] + " " + last_name[0]
        
        # profile_urn = get_values_for_key('dashEntityUrn', convos['elements'][thread_idx]['participants'][0])
        conversation_urn_id = convos['elements'][thread_idx]['dashEntityUrn'] 
        # print(conversation_urn_id) # urn:li:.....
        regex = r"conversation:(.+)" 
        match = re.search(regex, conversation_urn_id)
        if match:
            result = match.group(1)
            convo_list.append([full_name, result])
                    
    return convo_list

def GetConversationMessages(cookie_dict, conversation_urn_id):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    convo = api.get_conversation(conversation_urn_id)
    # print(convo)
    
    convo_list=[]

    for message_idx in range(0, len(convo['elements'])):
        t = convo['elements'][message_idx]['eventContent']
        s = convo['elements'][message_idx]['from']
        # print(t)
        cleaned_up_text = get_values_for_key('text', t)
        sent_by = get_values_for_key('firstName', s)
        # print(sent_by)
        # print(cleaned_up_text + sent_by)
        message = cleaned_up_text + sent_by
        convo_list.append(message)
            
    return convo_list
    
def GetPeopleInterests(cookie_dict, profile_urn):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    # print(profile_urn)

    person_interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
    person_interests = person_interests.json()
    person_interests_json = json.dumps(person_interests)

    # ============= Getting interests of People =============================
    pattern = re.compile(r'"(urn:li:fsd_profile:[^"]*)"')
    matches = re.findall(pattern, person_interests_json)

    people_the_profile_is_interested_in_set = set(matches)
    people_the_profile_is_interested_in = [s.split(':')[-1] for s in people_the_profile_is_interested_in_set]

    # print(people_the_profile_is_interested_in)

    # Get the profile urn, get the name and store in another list
    final_people_the_profile_is_interested_in = []
    for i, profile_urn in enumerate(people_the_profile_is_interested_in):

        if i == 4:
            break
    
        temp = api.get_profile(profile_urn)
        first_name = temp['firstName']
        last_name = temp['lastName']
        full_name = first_name + " " + last_name 
        final_people_the_profile_is_interested_in.append([full_name, profile_urn])

    # print(final_people_the_profile_is_interested_in)
    # print(len(final_people_the_profile_is_interested_in))
    # ============= Getting interests of People =============================
    
    return final_people_the_profile_is_interested_in
    
def GetCompanyInterests(cookie_dict, profile_urn):
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    person_interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
    person_interests = person_interests.json()
    person_interests_json = json.dumps(person_interests)
    
    # ============= Getting interests of Companies =============================
    pattern_for_company = re.compile(r'"(urn:li:fsd_company:[^"]*)"')
    matches_for_company = re.findall(pattern_for_company, person_interests_json)
    
    companies_the_profile_is_interested_in_set = set(matches_for_company)
    companies_the_profile_is_interested_in = [s.split(':')[-1] for s in companies_the_profile_is_interested_in_set]
    
    # get the profile urn, get the name and store in another list
    final_companies_the_profile_is_interested_in = []
    for i, company_id in enumerate(companies_the_profile_is_interested_in):

        if i == 4:
            break

        temp = api.get_company(company_id)
        company_name = temp['universalName']
        final_companies_the_profile_is_interested_in.append([company_name, company_id])

    # print(final_companies_the_profile_is_interested_in)
    # print(len(final_companies_the_profile_is_interested_in))
    # ============= Getting interests of Companies =============================
    
    return final_companies_the_profile_is_interested_in

def SalesNavigatorLeadsInfo(api):

    # Get the latest list created
    res_leads_list = api._fetch(
        f"/sales-api/salesApiLists?q=listType&listType=LEAD&listSources=List(MANUAL,SYSTEM,CRM_AT_RISK_OPPORTUNITY,CRM_SYNC,CRM_BLUEBIRD,BUYER_INTEREST,LINKEDIN_SALES_INSIGHTS,CSV_IMPORT,RECOMMENDATION,NEW_EXECS_IN_SAVED_ACCOUNTS,LEADS_TO_FOLLOW_UP,CRM_PERSON_ACCOUNT,BOOK_OF_BUSINESS)&isMetadataNeeded=true&start=0&count=25&sortCriteria=LAST_MODIFIED&sortOrder=DESCENDING&decoration=%28id%2ClistType%2ClistSource%2Cname%2Cdescription%2CcreatedAt%2Crole%2ClastModifiedAt%2ClastViewedAt%2CentityCount%2CunsavedEntityCount%2Cshared%2Csubscribed%2ClistCsvImportTask%2CmockList%2Ccreator~fs_salesProfile%28entityUrn%2CfullName%2CprofilePictureDisplayImage%29%2ClastModifiedBy~fs_salesProfile%28entityUrn%2CfullName%29%29"
        , base_request=True)
    res_leads_list_json = res_leads_list.json()
    print(res_leads_list_json)
    latest_list_id = res_leads_list_json["elements"][0]["id"]

    # Get the leads from the latest list
    res = api._fetch(
        f"/sales-api/salesApiPeopleSearch?q=peopleSearchQuery&query=(spotlightParam:(selectedType:ALL),doFetchSpotlights:true,doFetchHits:true,doFetchFilters:false,pivotParam:(com.linkedin.sales.search.LeadListPivotRequest:(list:urn%3Ali%3Afs_salesList%3A{latest_list_id},sortCriteria:LAST_ACTIVITY,sortOrder:DESCENDING)),list:(scope:LEAD,includeAll:false,excludeAll:false,includedValues:List((id:{latest_list_id}))))&start=0&count=25&decoration=%28entityUrn%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cdegree%2CblockThirdPartyDataSharing%2CcrmStatus%2CgeoRegion%2ClastUpdatedTimeInListAt%2CpendingInvitation%2CnewListEntitySinceLastViewed%2Csaved%2CleadAssociatedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CoutreachActivity%2Cmemorialized%2ClistCount%2CsavedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CnotificationUrnOnLeadList%2CuniquePositionCompanyCount%2CcurrentPositions*%28title%2CcompanyName%2Ccurrent%2CcompanyUrn%29%2CmostRecentEntityNote%28body%2ClastModifiedAt%2CnoteId%2Cseat%2Centity%2CownerInfo%2Cownership%2Cvisibility%29%29",
        base_request=True)
    # print(res.text)
    # print(res.json())

    leads_list_unparsed = res.json()["elements"]

    regex = r"urn:li:fs_salesProfile:(.+)" 

    lead_list = []
    member_urn_id_list = []
    for lead in leads_list_unparsed:
        match = re.search(regex, lead['entityUrn'])
        # Only include a lead if they have a member_urn_id
        if match:
            member_urn_id = match.group(1)
            # print(member_urn_id, type(member_urn_id))
            # print(lead['fullName'], lead['currentPositions'])
            title, company_name, geo_region = '', '', ''

            # Checks if geoRegion, companyName, title are present
            if lead['geoRegion']:
                geo_region = lead['geoRegion']

            if len(lead['currentPositions']) > 0:
                if lead['currentPositions'][0]['title']:
                    title = lead['currentPositions'][0]['title']
                if lead['currentPositions'][0]['companyName']:
                    company_name = lead['currentPositions'][0]['companyName']
            
            # Add to lead_list
            lead_list.append([
                lead['fullName'],
                title,
                company_name,
                geo_region,
                member_urn_id,
            ])
            member_urn_id_list.append(member_urn_id)

    return lead_list, member_urn_id_list

# TODO: Change function name to show that this is returning Connect note not info
# TODO: Add summary
# TODO: Add relationships
# TODO: Get interests at random
def GetLeadInfo(cookie_dict, leads_list, member_urn_id_list):

    api = Linkedin(cookies=cookie_dict) # type: ignore
    t = []
    for lead_idx, profile_urn in enumerate(member_urn_id_list):
        
        # Testing
        # print(lead_idx)
        if lead_idx == 4:
            break   

        lead_info = []
        # ============= Getting Relationships =============================        
        # res_for_shared_relationships = api._fetch(f"/sales-api/salesApiProfileHighlights/{profile_urn}?decoration=%28sharedConnection%28sharedConnectionUrns*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29%2CteamlinkInfo%28totalCount%29%2CsharedEducations*%28overlapInfo%2CentityUrn~fs_salesSchool%28entityUrn%2ClogoId%2Cname%2Curl%2CschoolPictureDisplayImage%29%29%2CsharedExperiences*%28overlapInfo%2CentityUrn~fs_salesCompany%28entityUrn%2CpictureInfo%2Cname%2CcompanyPictureDisplayImage%29%29%2CsharedGroups*%28entityUrn~fs_salesGroup%28entityUrn%2Cname%2ClargeLogoId%2CsmallLogoId%2CgroupPictureDisplayImage%29%29%29"
        #         ,base_request=True)
        # # print(res_for_shared_relationships.text)
        # print(res_for_shared_relationships.json())

        # # Get the first relationship that LinkedIn recommends
        # lead_relationships = []
        # shared_connections = res_for_shared_relationships.json()['sharedConnection']['sharedConnectionUrnsResolutionResults']
        # if len(shared_connections.values()) > 0:
        #     shared_connection = shared_connections.values()[0]['fullName']
        #     lead_relationships.append(shared_connection)

        # shared_groups = res_for_shared_relationships.json()['sharedGroup']['entityUrnResolutionResult']
        # if len(shared_groups) >= 1:
        #     shared_group = shared_groups[1]['entityUrnResolutionResult']['name'] 
        #     lead_relationships.append(shared_group)
        
        # lead_info.append(lead_relationships)
        # ============= Getting Relationships =============================
        
        # ============= Getting interests =================================
        lead_interests = []
        interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
        interests = interests.json()
        interests_json = json.dumps(interests)

        print(interests_json)

        pattern = re.compile(r'"(urn:li:fsd_profile:[^"]*)"')
        matches = re.findall(pattern, interests_json)
        people_the_profile_is_interested_in_set = set(matches)
        people_the_profile_is_interested_in = [s.split(':')[-1] for s in people_the_profile_is_interested_in_set]

        print(people_the_profile_is_interested_in)

        pattern_for_company = re.compile(r'"(urn:li:fsd_company:[^"]*)"')
        matches_for_company = re.findall(pattern_for_company, interests_json)
        companies_the_profile_is_interested_in_set = set(matches_for_company)
        companies_the_profile_is_interested_in = [s.split(':')[-1] for s in companies_the_profile_is_interested_in_set]

        print(companies_the_profile_is_interested_in)

        for i, profile_urn in enumerate(people_the_profile_is_interested_in):
            if i == 1:
                break
            temp = api.get_profile(profile_urn)
            first_name = temp['firstName']
            last_name = temp['lastName']
            full_name = first_name + " " + last_name 
            lead_interests.append(full_name)
        
        for i, company_id in enumerate(companies_the_profile_is_interested_in):
            if i == 1:
                break
            temp = api.get_company(company_id)
            company_name = temp['universalName']
            lead_interests.append([company_name, company_id])
        
        lead_info.append(lead_interests)
        # ============= Getting interests =================================
        
        # prompt = "This is the profile of a person: " + leads_list[lead_idx][0] + \
        #     " These are their interests: " + ",".join(lead_interests) + \
        #     " These are our mutual connections: " + "" + \
        #     " Include something useful about the interests and use it in the request. " + \
        #     " Write a connect note to them. Make it casual but eyecatching. Use only 50 words."
        
        prompt = "This is the profile of a person: " + leads_list[lead_idx][0] + \
            " Include something useful about the interests and use it in the request. " + \
            " Write a connect note to them. Make it casual but eyecatching. Use only 50 words."

        # connect_note = asyncio.run(UseBingAI(prompt))
        connect_note = UseChatGPT(prompt)
        # print(connect_note)
        # connect_note = "hi," + leads_list[lead_idx][0]
        t.append(connect_note)
    return t

# ================================================ ROUTES START =============================================

@app.route('/search-zoominfo', methods=['POST'])
def search_zoominfo():

    company_name = request.json['companyName'] # type: ignore
    data = requests.get(f"http://167.99.250.232:5555/{company_name}")   
    # print(data.json())
    return data.json()

@app.route('/search-leads-in-db', methods=['POST'])
def search_leads_in_db():

    lead_name = request.json['leadName'] # type: ignore
    title = request.json['title'] # type: ignore
    current_company = request.json['currentCompany'] # type: ignore
    location = request.json['location'] # type: ignore
 
    data = dbCon.search_leads(lead_name, title, current_company, location) # type: ignore
    
    return jsonify(success=True, message=data)

@app.route('/get-lead-info', methods=['POST'])
def get_lead_info():

    session_id = request.json['sessionId'] # type: ignore
    # print("get_lead_info session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_lead_info cookie_dict: ", cookie_dict)

    leads_list = request.json['leadsArray'] # type: ignore
    member_urn_id_list = request.json['memberUrnIdArray'] # type: ignore
 
    data = q.enqueue(GetLeadInfo, cookie_dict, leads_list, member_urn_id_list, job_timeout=600)
    job_id = data.get_id()

    return jsonify(success=True, message=job_id)

@app.route('/get-leads', methods=['POST'])
def get_leads():

    session_id = request.json['sessionId'] # type: ignore
    # print("get_leads session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_leads cookie_dict: ", cookie_dict)
    
    api = Linkedin(cookies=cookie_dict) # type: ignore
    lead_list, member_urn_id_list = SalesNavigatorLeadsInfo(api)
    dbCon.store_leads(lead_list)

    return jsonify(success=True, lead_list=lead_list, member_urn_id_list=member_urn_id_list)

@app.route('/use-bingai', methods=['POST'])
def use_bingai():

    prompt = request.json['prompt'] # type: ignore    
    data = q.enqueue(UseBingAI, prompt)
    job_id = data.get_id()

    return jsonify(success=True, message=job_id)

@app.route('/use-chatgpt', methods=['POST'])
def use_chatgpt():

    prompt = request.json['prompt'] # type: ignore   
    data = q.enqueue(UseChatGPT, prompt)
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)

# @app.route('/receive-link', methods=['POST'])
# def receive_link():

#     session_id = request.json['sessionId'] # type: ignore
#     # print("receive_link session_id: ", session_id)

#     # TODO: error handling
#     cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
#     # print("receive_link cookie_dict: ", cookie_dict)
    
#     # cookie_dict = request.json['cookie'] # type: ignore
#     api = Linkedin(cookies=cookie_dict) # type: ignore

#     search_params = request.json
#     location = request.json['location'] # type: ignore
#     mutual_connections_boolean = request.json['mutualConnections'] # type: ignore
    
#     if location != '':
#         location_geo_urn = GetGeoUrn(api, location)
#         data = q.enqueue(GetProfile, cookie_dict, search_params, location_geo_urn, mutual_connections_boolean)

#     else:
#         data = q.enqueue(GetProfile, cookie_dict, search_params, '', mutual_connections_boolean)
            
#     job_id = data.get_id()
    
#     return jsonify(success=True, message=job_id)
    
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
    
    session_id = request.json['sessionId'] # type: ignore
    # print("get_people_interests session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_people_interests cookie_dict: ", cookie_dict)

    profile_urn = request.json['profileUrn'] # type: ignore
    
    data = q.enqueue(GetPeopleInterests, cookie_dict, profile_urn)
    
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)

@app.route('/get-company-interests', methods=['POST'])
def get_company_interests():
    
    session_id = request.json['sessionId'] # type: ignore
    # print("get_company_interests session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_company_interests cookie_dict: ", cookie_dict)
    
    profile_urn = request.json['profileUrn'] # type: ignore

    data = q.enqueue(GetCompanyInterests, cookie_dict, profile_urn)
    
    job_id = data.get_id()
    
    return jsonify(success=True, message=job_id)
     
@app.route('/get-convo-threads', methods=['POST'])
def get_convo_threads():

    session_id = request.json['sessionId'] # type: ignore
    # print("get_convo_threads session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_convo_threads cookie_dict: ", cookie_dict)

    api = Linkedin(cookies=cookie_dict) # type: ignore
    
    data = GetConversationThreads(api)
    # print("GetConversationThreads output: ", data)
    
    return jsonify(success=True, message=data)

@app.route('/get-convo-messages', methods=['POST'])
def get_convo_messages():
    
    session_id = request.json['sessionId'] # type: ignore
    # print("get_convo_messages session_id: ", session_id)

    # TODO: error handling
    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_convo_messages cookie_dict: ", cookie_dict)

    thread_id = request.json['threadId'] # type: ignore
    
    data = GetConversationMessages(cookie_dict, thread_id)
   
    return jsonify(success=True, message=data)

@app.route('/send-connect', methods=['POST'])
def send_connect():

    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore

    profile_id = request.json['profileId'] # type: ignore
    text = request.json['text'] # type: ignore
    
    error_boolean = api.add_connection(profile_id, text)
    return jsonify(success=True, message=error_boolean)

@app.route('/send-message', methods=['POST'])
def send_message():
    
    cookie_dict = request.json['cookie'] # type: ignore
    api = Linkedin(cookies=cookie_dict) # type: ignore

    profile_id = request.json['profileId'] # type: ignore
    text = request.json['text'] # type: ignore
    data = api.send_message(message_body = text, recipients=[profile_id])

    # TODO: Error handling of data variable

    return jsonify(success=True, message='sent message')

@app.route('/save-cookie', methods=['POST'])
def save_cookie():
    
    cookies_list = request.json['cookie'] # type: ignore  
    cookie_dict = cookies_list_to_cookie_dict(cookies_list)

    # TODO: Error handling (check if api is possible)
    api = Linkedin(cookies=cookie_dict) # type: ignore

    # Save the cookie_dict in DB and return a session_id for the user
    # The session_id will be passed back by the user, it will be checked against the DB
    # and will return the cookie_dict to be passed in the LinkedIn API.
    session_id = dbCon.store_cookie_return_sessionid(cookie_dict)

    return jsonify(success=True, message="success", session_id=session_id)

@app.errorhandler(404)
def not_found(e):
    print("not found, error 404")
    return app.send_static_file("index.html")
# ================================================ ROUTES END =============================================

if __name__ == "__main__":
	app.run(host='0.0.0.0')