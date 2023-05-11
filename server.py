# Style guidelines:
# cookie, not cookies
# LinkedIn, not Linkedin

import re
# import asyncio
import json

from linkedin_api import Linkedin

from flask import Flask, request, jsonify
from flask_cors import CORS

from rq import Queue
from worker import conn

from rq.job import Job

import openai

import dbCon

import requests

import time

import math

import jsonpickle

q = Queue(connection=conn)

app = Flask(
    __name__,
    static_url_path='',
    static_folder="client/build")

# Enables CORS (this is only needed when working with React.js, I don't know why)
CORS(app, resources={r"/*": {"origins": "*"}})

from dotenv import load_dotenv
load_dotenv()

import os

# openai.api_key = os.environ.get("OPENAI_API_KEY")

# async def UseBingAI(prompt):
    
#     # This is getting my own bing cookies
#     bot = Chatbot(cookie_path='./cookie.json') # type: ignore

#     ans_json = await bot.ask(prompt=prompt)
#     ans = ans_json['item']['messages'][1]['text']
    
#     await bot.close()
#     return ans

def UseChatGPT(prompt):

    openai.api_key = os.environ.get("OPENAI_API_KEY")

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
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

    # print(person_interests_json)

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
    
        temp = api.get_profile_name(profile_urn) # type: ignore
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

    # Display last 5 lead lists, along with all of their leads in a list
    # Client-side, when one is clicked load it with it's leads
    # Have 1 Home component, with all of its arrays variable length
    # Disable all buttons when any 5 of the Auto Create Note Buttons is clicked
    # Don't disable the Auto Create Note Buttons when any Auto Create Note Button is clicked
    # Need to implement pagination first

    # Get the latest list created
    res_leads_list = api._fetch(
        f"/sales-api/salesApiLists?q=listType&listType=LEAD&listSources=List(MANUAL,SYSTEM,CRM_AT_RISK_OPPORTUNITY,CRM_SYNC,CRM_BLUEBIRD,BUYER_INTEREST,LINKEDIN_SALES_INSIGHTS,CSV_IMPORT,RECOMMENDATION,NEW_EXECS_IN_SAVED_ACCOUNTS,LEADS_TO_FOLLOW_UP,CRM_PERSON_ACCOUNT,BOOK_OF_BUSINESS)&isMetadataNeeded=true&start=0&count=25&sortCriteria=LAST_MODIFIED&sortOrder=DESCENDING&decoration=%28id%2ClistType%2ClistSource%2Cname%2Cdescription%2CcreatedAt%2Crole%2ClastModifiedAt%2ClastViewedAt%2CentityCount%2CunsavedEntityCount%2Cshared%2Csubscribed%2ClistCsvImportTask%2CmockList%2Ccreator~fs_salesProfile%28entityUrn%2CfullName%2CprofilePictureDisplayImage%29%2ClastModifiedBy~fs_salesProfile%28entityUrn%2CfullName%29%29"
        , base_request=True)
    res_leads_list_json = res_leads_list.json()
    # print(res_leads_list_json)
    latest_list_id = res_leads_list_json["elements"][0]["id"]

    # Get the leads from the latest list
    res = api._fetch(
        f"/sales-api/salesApiPeopleSearch?q=peopleSearchQuery&query=(spotlightParam:(selectedType:ALL),doFetchSpotlights:true,doFetchHits:true,doFetchFilters:false,pivotParam:(com.linkedin.sales.search.LeadListPivotRequest:(list:urn%3Ali%3Afs_salesList%3A{latest_list_id},sortCriteria:LAST_ACTIVITY,sortOrder:DESCENDING)),list:(scope:LEAD,includeAll:false,excludeAll:false,includedValues:List((id:{latest_list_id}))))&start=0&count=25&decoration=%28entityUrn%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cdegree%2CblockThirdPartyDataSharing%2CcrmStatus%2CgeoRegion%2ClastUpdatedTimeInListAt%2CpendingInvitation%2CnewListEntitySinceLastViewed%2Csaved%2CleadAssociatedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CoutreachActivity%2Cmemorialized%2ClistCount%2CsavedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CnotificationUrnOnLeadList%2CuniquePositionCompanyCount%2CcurrentPositions*%28title%2CcompanyName%2Ccurrent%2CcompanyUrn%29%2CmostRecentEntityNote%28body%2ClastModifiedAt%2CnoteId%2Cseat%2Centity%2CownerInfo%2Cownership%2Cvisibility%29%29",
        base_request=True)
    # print(res.text)
    # print(res.json())

    # Pagination
    number_of_pages = 1
    leads_list_total = res.json()["paging"]["total"]
    if leads_list_total > 25:
        # Multiple pages
        pages_in_float = leads_list_total / 25  
        number_of_pages = math.ceil(pages_in_float) 

    current_count = 0
    start = 0
    lead_list = []
    member_urn_id_list = []

    if number_of_pages > 1:

        for page in range(0, number_of_pages):

            # print(page, number_of_pages)
            if ( (leads_list_total - current_count) == 0):
                break

            if (leads_list_total - current_count) < 25:
                # This is the last page
                last_count = (leads_list_total - current_count)
                res = api._fetch(
                    f"/sales-api/salesApiPeopleSearch?q=peopleSearchQuery&query=(spotlightParam:(selectedType:ALL),doFetchSpotlights:true,doFetchHits:true,doFetchFilters:false,pivotParam:(com.linkedin.sales.search.LeadListPivotRequest:(list:urn%3Ali%3Afs_salesList%3A{latest_list_id},sortCriteria:LAST_ACTIVITY,sortOrder:DESCENDING)),list:(scope:LEAD,includeAll:false,excludeAll:false,includedValues:List((id:{latest_list_id}))))&start={start}&count={current_count}&decoration=%28entityUrn%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cdegree%2CblockThirdPartyDataSharing%2CcrmStatus%2CgeoRegion%2ClastUpdatedTimeInListAt%2CpendingInvitation%2CnewListEntitySinceLastViewed%2Csaved%2CleadAssociatedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CoutreachActivity%2Cmemorialized%2ClistCount%2CsavedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CnotificationUrnOnLeadList%2CuniquePositionCompanyCount%2CcurrentPositions*%28title%2CcompanyName%2Ccurrent%2CcompanyUrn%29%2CmostRecentEntityNote%28body%2ClastModifiedAt%2CnoteId%2Cseat%2Centity%2CownerInfo%2Cownership%2Cvisibility%29%29",
                    base_request=True)

                leads_list_unparsed = res.json()["elements"]
                # print(leads_list_unparsed)
                # print(api.get_profile("15647628"))

                regex = r"urn:li:fs_salesProfile:(.+)" 

                for lead in leads_list_unparsed:
                    match = re.search(regex, lead['entityUrn'])
                    # Only include a lead if they have a member_urn_id
                    if match:
                        member_urn_id = match.group(1)
                        # print(member_urn_id, type(member_urn_id))
                        # print(lead['fullName'], lead['currentPositions'])
                        title, company_name, geo_region = '', '', ''

                        # Checks if geoRegion, companyName, title are present
                        if 'geoRegion' in lead:
                            geo_region = lead['geoRegion']

                        if len(lead['currentPositions']) > 0:
                            if lead['currentPositions'][0]['title']:
                                title = lead['currentPositions'][0]['title']
                            if lead['currentPositions'][0]['companyName']:
                                company_name = lead['currentPositions'][0]['companyName']
                        
                        pending_invitation = False
                        if 'pendingInvitation' in lead:
                            pending_invitation = lead['pendingInvitation']

                        # Add to lead_list
                        lead_list.append([
                            lead['fullName'],
                            title,
                            company_name,
                            geo_region,
                            member_urn_id,
                            pending_invitation
                        ])
                        member_urn_id_list.append(member_urn_id)

                # break
            else:
                print("i ran")
                if page == 0:
                    res = api._fetch(
                        f"/sales-api/salesApiPeopleSearch?q=peopleSearchQuery&query=(spotlightParam:(selectedType:ALL),doFetchSpotlights:true,doFetchHits:true,doFetchFilters:false,pivotParam:(com.linkedin.sales.search.LeadListPivotRequest:(list:urn%3Ali%3Afs_salesList%3A{latest_list_id},sortCriteria:LAST_ACTIVITY,sortOrder:DESCENDING)),list:(scope:LEAD,includeAll:false,excludeAll:false,includedValues:List((id:{latest_list_id}))))&start={start}&count={25}&decoration=%28entityUrn%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cdegree%2CblockThirdPartyDataSharing%2CcrmStatus%2CgeoRegion%2ClastUpdatedTimeInListAt%2CpendingInvitation%2CnewListEntitySinceLastViewed%2Csaved%2CleadAssociatedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CoutreachActivity%2Cmemorialized%2ClistCount%2CsavedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CnotificationUrnOnLeadList%2CuniquePositionCompanyCount%2CcurrentPositions*%28title%2CcompanyName%2Ccurrent%2CcompanyUrn%29%2CmostRecentEntityNote%28body%2ClastModifiedAt%2CnoteId%2Cseat%2Centity%2CownerInfo%2Cownership%2Cvisibility%29%29",
                        base_request=True)
                else:
                    res = api._fetch(
                        f"/sales-api/salesApiPeopleSearch?q=peopleSearchQuery&query=(spotlightParam:(selectedType:ALL),doFetchSpotlights:true,doFetchHits:true,doFetchFilters:false,pivotParam:(com.linkedin.sales.search.LeadListPivotRequest:(list:urn%3Ali%3Afs_salesList%3A{latest_list_id},sortCriteria:LAST_ACTIVITY,sortOrder:DESCENDING)),list:(scope:LEAD,includeAll:false,excludeAll:false,includedValues:List((id:{latest_list_id}))))&start={start}&count={current_count}&decoration=%28entityUrn%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cdegree%2CblockThirdPartyDataSharing%2CcrmStatus%2CgeoRegion%2ClastUpdatedTimeInListAt%2CpendingInvitation%2CnewListEntitySinceLastViewed%2Csaved%2CleadAssociatedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CoutreachActivity%2Cmemorialized%2ClistCount%2CsavedAccount~fs_salesCompany%28entityUrn%2Cname%29%2CnotificationUrnOnLeadList%2CuniquePositionCompanyCount%2CcurrentPositions*%28title%2CcompanyName%2Ccurrent%2CcompanyUrn%29%2CmostRecentEntityNote%28body%2ClastModifiedAt%2CnoteId%2Cseat%2Centity%2CownerInfo%2Cownership%2Cvisibility%29%29",
                        base_request=True)

                leads_list_unparsed = res.json()["elements"]
                # print(leads_list_unparsed)
                # print(api.get_profile("15647628"))

                regex = r"urn:li:fs_salesProfile:(.+)" 

                for lead in leads_list_unparsed:
                    match = re.search(regex, lead['entityUrn'])
                    # Only include a lead if they have a member_urn_id
                    if match:
                        member_urn_id = match.group(1)
                        # print(member_urn_id, type(member_urn_id))
                        # print(lead['fullName'], lead['currentPositions'])
                        title, company_name, geo_region = '', '', ''

                        # Checks if geoRegion, companyName, title are present
                        if 'geoRegion' in lead:
                            geo_region = lead['geoRegion']

                        if len(lead['currentPositions']) > 0:
                            if lead['currentPositions'][0]['title']:
                                title = lead['currentPositions'][0]['title']
                            if lead['currentPositions'][0]['companyName']:
                                company_name = lead['currentPositions'][0]['companyName']
                        
                        pending_invitation = False
                        if 'pendingInvitation' in lead:
                            pending_invitation = lead['pendingInvitation']

                        # Add to lead_list
                        lead_list.append([
                            lead['fullName'],
                            title,
                            company_name,
                            geo_region,
                            member_urn_id,
                            pending_invitation
                        ])
                        member_urn_id_list.append(member_urn_id)
            
                current_count += 25
                start += 25

            print(lead_list)
    else:
        leads_list_unparsed = res.json()["elements"]
        # print(leads_list_unparsed)
        # print(api.get_profile("15647628"))

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
                if 'geoRegion' in lead:
                    geo_region = lead['geoRegion']

                if len(lead['currentPositions']) > 0:
                    if lead['currentPositions'][0]['title']:
                        title = lead['currentPositions'][0]['title']
                    if lead['currentPositions'][0]['companyName']:
                        company_name = lead['currentPositions'][0]['companyName']
                
                pending_invitation = False
                if 'pendingInvitation' in lead:
                    pending_invitation = lead['pendingInvitation']

                # Add to lead_list
                lead_list.append([
                    lead['fullName'],
                    title,
                    company_name,
                    geo_region,
                    member_urn_id,
                    pending_invitation
                ])
                member_urn_id_list.append(member_urn_id)

    return lead_list, member_urn_id_list, number_of_pages

# TODO: Get interests at random
def GetLeadInfo(cookie_dict, my_full_name, my_occupation, lead, profile_urn, additional_info_text="", interests=""):

    # interests fetch execution time: 4.0456929206848145 seconds
    # interests people compile execution time: 0.0001327991485595703 seconds
    # interests company compile execution time: 9.846687316894531e-05 seconds
    # interests for loop execution time: 1.1920928955078125e-06 seconds
    # company interests for loop execution time: 4.76837158203125e-06 seconds
    
    # print("additional info: ", additional_info_text)
    # print("profile_urn", profile_urn)

    time.sleep(3)

    api = Linkedin(cookies=cookie_dict) # type: ignore

    my_tuple = tuple(profile_urn.strip("()").split(","))

    actual_profile_urn, auth_type, auth_token = my_tuple 
    profile_urn_for_lead_profile = "profileId:"+actual_profile_urn
    auth_type_for_lead_profile = "authType:"+auth_type
    auth_token_for_lead_profile = "authToken:"+auth_token 

    lead_info = []
    # print(profile_urn)
    
    # ============= Getting Relationships =============================       
    start_time = time.time()
 
    res_for_shared_relationships = api._fetch(f"/sales-api/salesApiProfileHighlights/{actual_profile_urn}?decoration=%28sharedConnection%28sharedConnectionUrns*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29%2CteamlinkInfo%28totalCount%29%2CsharedEducations*%28overlapInfo%2CentityUrn~fs_salesSchool%28entityUrn%2ClogoId%2Cname%2Curl%2CschoolPictureDisplayImage%29%29%2CsharedExperiences*%28overlapInfo%2CentityUrn~fs_salesCompany%28entityUrn%2CpictureInfo%2Cname%2CcompanyPictureDisplayImage%29%29%2CsharedGroups*%28entityUrn~fs_salesGroup%28entityUrn%2Cname%2ClargeLogoId%2CsmallLogoId%2CgroupPictureDisplayImage%29%29%29"
            ,base_request=True)
    # print("res_for_shared_relationships text", res_for_shared_relationships.text)
    # print("res_for_shared_relationships json", res_for_shared_relationships.json())

    # Get the first relationship that LinkedIn recommends
    lead_relationships = []
    if 'sharedConnection' in res_for_shared_relationships.json():
        if 'sharedConnectionUrnsResolutionResults' in res_for_shared_relationships.json()['sharedConnection']:  
            shared_connections = res_for_shared_relationships.json()['sharedConnection']['sharedConnectionUrnsResolutionResults']
            if len(shared_connections.values()) > 0:
                shared_connection = list(shared_connections.values())[0]['fullName']
                lead_relationships.append(shared_connection)
    
    if 'sharedGroup' in res_for_shared_relationships.json():
        if 'entityUrnResolutionResult' in res_for_shared_relationships.json()['sharedGroup']:
            shared_groups = res_for_shared_relationships.json()['sharedGroup']['entityUrnResolutionResult']
            if len(shared_groups) >= 1:
                shared_group = shared_groups[1]['entityUrnResolutionResult']['name'] 
                lead_relationships.append(shared_group)
    
    # lead_info.append(lead_relationships)
    # print(lead_relationships)
    end_time = time.time()
    print(f"relationships execution time: {end_time - start_time} seconds")
    # ============= Getting Relationships =============================

    # ============= Getting Misc info =============================
    lead_profile = api._fetch(f"/sales-api/salesApiProfiles/({profile_urn_for_lead_profile},{auth_type_for_lead_profile},{auth_token_for_lead_profile})?decoration=%28%0A%20%20entityUrn%2C%0A%20%20objectUrn%2C%0A%20%20firstName%2C%0A%20%20lastName%2C%0A%20%20fullName%2C%0A%20%20headline%2C%0A%20%20memberBadges%2C%0A%20%20pronoun%2C%0A%20%20degree%2C%0A%20%20profileUnlockInfo%2C%0A%20%20latestTouchPointActivity%2C%0A%20%20location%2C%0A%20%20listCount%2C%0A%20%20summary%2C%0A%20%20savedLead%2C%0A%20%20defaultPosition%2C%0A%20%20contactInfo%2C%0A%20%20crmStatus%2C%0A%20%20pendingInvitation%2C%0A%20%20unlocked%2C%0A%20%20flagshipProfileUrl%2C%0A%20%20fullNamePronunciationAudio%2C%0A%20%20memorialized%2C%0A%20%20numOfConnections%2C%0A%20%20numOfSharedConnections%2C%0A%20%20showTotalConnectionsPage%2C%0A%20%20profilePictureDisplayImage%2C%0A%20%20profileBackgroundPicture%2C%0A%20%20relatedColleagueCompanyId%2C%0A%20%20blockThirdPartyDataSharing%2C%0A%20%20noteCount%2C%0A%20%20positions*%28%0A%20%20%20%20companyName%2C%0A%20%20%20%20current%2C%0A%20%20%20%20new%2C%0A%20%20%20%20description%2C%0A%20%20%20%20endedOn%2C%0A%20%20%20%20posId%2C%0A%20%20%20%20startedOn%2C%0A%20%20%20%20title%2C%0A%20%20%20%20location%2C%0A%20%20%20%20richMedia*%2C%0A%20%20%20%20companyUrn~fs_salesCompany%28entityUrn%2Cname%2CcompanyPictureDisplayImage%29%0A%20%20%29%2C%0A%20%20educations*%28%0A%20%20%20%20degree%2C%0A%20%20%20%20eduId%2C%0A%20%20%20%20endedOn%2C%0A%20%20%20%20schoolName%2C%0A%20%20%20%20startedOn%2C%0A%20%20%20%20fieldsOfStudy*%2C%0A%20%20%20%20richMedia*%2C%0A%20%20%20%20school~fs_salesSchool%28entityUrn%2ClogoId%2Cname%2Curl%2CschoolPictureDisplayImage%29%0A%20%20%29%2C%0A%20%20languages*%0A%29"
                                ,base_request=True)
    # print("lead_profile: ", lead_profile.json())
    lead_profile_json = lead_profile.json()
    
    if "headline" in lead_profile_json:
        lead_headline = lead_profile_json["headline"]
    else:
        lead_headline = ''

    if "location" in lead_profile_json:     
        lead_location = lead_profile_json["location"]
    else:
        lead_location = ''

    if "summary" in lead_profile_json:
        lead_summary = lead_profile_json["summary"]
    else:
        lead_summary = ""
    # ============= Getting Misc info =============================

    # ============= Getting interests =================================

    # lead_interests = []
    # if interests == "":

    #     start_time = time.time()
    #     interests = api._fetch(f"/graphql?includeWebMetadata=True&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A{profile_urn},sectionType:interests,tabIndex:1,locale:en_US)&&queryId=voyagerIdentityDashProfileComponents.38247e27f7b9b2ecbd8e8452e3c1a02c")
    #     end_time = time.time()
    #     print(f"interests fetch execution time: {end_time - start_time} seconds")

    #     interests = interests.json()
    #     interests_json = json.dumps(interests)
        
    #     # print(interests_json)
    #     pattern = re.compile(r'"(urn:li:fsd_profile:[^"]*)"')
    #     matches = re.findall(pattern, interests_json)
    #     people_the_profile_is_interested_in_set = set(matches)
    #     people_the_profile_is_interested_in = [s.split(':')[-1] for s in people_the_profile_is_interested_in_set]

    #     pattern_for_company = re.compile(r'"(urn:li:fsd_company:[^"]*)"')
    #     matches_for_company = re.findall(pattern_for_company, interests_json)
    #     companies_the_profile_is_interested_in_set = set(matches_for_company)
    #     companies_the_profile_is_interested_in = [s.split(':')[-1] for s in companies_the_profile_is_interested_in_set]

    #     # print(companies_the_profile_is_interested_in)

    #     for i, profile_urn in enumerate(people_the_profile_is_interested_in):
    #         if i == 1:
    #             break
    #         temp = api.get_profile_name(profile_urn) # type: ignore
    #         first_name = temp['firstName']
    #         last_name = temp['lastName']
    #         full_name = first_name + " " + last_name 
    #         lead_interests.append(full_name)

    #     for i, company_id in enumerate(companies_the_profile_is_interested_in):
    #         if i == 1:
    #             break
    #         temp = api.get_company(company_id)
    #         company_name = temp['universalName']
    #         lead_interests.append([company_name, company_id])
        
    #     lead_info.append(lead_interests)
    #     interests = " ".join(str(x) for x in lead_info)
    # ============= Getting interests =================================


    full_lead_profile = f"You are {my_full_name}, a {my_occupation} at DTC Force, located in Toronto. DTC Force is a Salesforce implementation company. This is the profile of a person: Name: {lead[0]}"

    if lead_headline != "":
        full_lead_profile += " About: " + lead_headline
    if lead_summary != "":
        full_lead_profile += " Summary: " + lead_summary
    if lead_location != "":
        full_lead_profile += " Location: " + lead_location
    if interests != "":
        full_lead_profile += " Interests: " + interests + " Use the interests"

    if len(lead_relationships) > 0:
        full_lead_profile += " Mutual relationships: " + " ".join(str(x) for x in lead_relationships)
    if additional_info_text != "":
        full_lead_profile += " Additional info: " + additional_info_text
    
    full_lead_profile += " Write a connect note to them. Make it casual but eyecatching. Do not use more than 50 words."

    # connect_note = asyncio.run(UseBingAI(prompt))
    connect_note = UseChatGPT(full_lead_profile)
    # print(connect_note)
    # connect_note = "hi," + leads_list[lead_idx][0]
    return connect_note

# ================================================ ROUTES START =============================================

# ========== For testing ==================
# @app.route('/kill-all-jobs', methods=['POST'])
# def kill_all_jobs():
#     q.empty()
#     print("killed all jobs")
#     return jsonify(success=True, message="killed all jobs")
# ========== For testing ==================


@app.route('/send-job-array', methods=['POST'])
def send_job_array():
    # TODO: Error handling
    
    job_id_list = request.json['jobIdArray'] # type: ignore
    
    print(job_id_list, type(job_id_list))

    for job_dict in job_id_list:
        job_status = job.get_status() # type: ignore
        for job_id, job_info in job_dict.items():
            idx = job_dict[job_id]['idx']
            job = q.fetch_job(job_id)
            if job.is_finished: # type: ignore
                job_dict[job_id] = {'idx': idx, 'status': 'finished', 'result': job.result} # type: ignore

    return jsonify(success=True, message="success", job_list = job_id_list)

@app.route('/search-zoominfo', methods=['POST'])
def search_zoominfo():
    try:
        company_name = request.json['companyName'] # type: ignore
        data = requests.get(f"http://167.99.250.232:5555/{company_name}")   
        # print(data.json())
        if len(data.json()) == 0: # type: ignore
            return jsonify(success=False, message="error")
        return data.json()
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/search-leads-in-db', methods=['POST'])
def search_leads_in_db():

    try:
        lead_name = request.json['leadName'] # type: ignore
        title = request.json['title'] # type: ignore
        current_company = request.json['currentCompany'] # type: ignore
        location = request.json['location'] # type: ignore
    
        data = dbCon.search_leads(lead_name, title, current_company, location) # type: ignore
        if data == False:
            return jsonify(success=False, message="error")    
        return jsonify(success=True, message=data)
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/stop-jobs-in-array', methods=['POST'])
def stop_jobs_in_array():
    
    session_id = request.json['sessionId'] # type: ignore
    # print("get_lead_info session_id: ", session_id)

    cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
    # print("get_lead_info cookie_dict: ", cookie_dict)

    job_id_list = request.json['jobIdArray'] # type: ignore
    # job_id_list = job_id_list['message']
    # print("job_id_list", job_id_list)

    # print(job_id_list)

    for i, job_id in enumerate(job_id_list):
        if job_id != "None":
            job = Job.fetch(job_id, connection=conn)
            job.cancel()
            job.delete()

    return jsonify(success=True, message="success")

@app.route('/get-lead-info', methods=['POST'])
def get_lead_info():

    try:
        # print(request.json)

        session_id = request.json['sessionId'] # type: ignore
        # print("get_lead_info session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_lead_info cookie_dict: ", cookie_dict)

        leads_list = request.json['leadsArray'] # type: ignore
        member_urn_id_list = request.json['memberUrnIdArray'] # type: ignore

        # print(leads_list, member_urn_id_list)

        additional_info_text = request.json['additionalInfoText'] # type: ignore
        # print("additional_info_text is ", additional_info_text)
        interests = request.json['interests'] # type: ignore

        data = dbCon.search_my_info(session_id)
        # print(data)
        full_name = data[0][0] # type: ignore
        occupation = data[0][1] # type: ignore

        # print(interests)
        job_ids={}
        for i, profile_urn in enumerate(member_urn_id_list):

            # Testing
            if i == 2:
                break

            data = q.enqueue(GetLeadInfo, cookie_dict, full_name, occupation, leads_list[i], profile_urn, additional_info_text, interests, result_ttl = 1, job_timeout=600)
    
            job_id = data.get_id()
            job_ids[job_id] = {'idx': i, 'status': 'queued', 'result': None}

        return jsonify(success=True, message=[job_ids])
    except Exception as e:
        print(e)
        return jsonify(success=False, message=str(e))


@app.route('/get-leads', methods=['POST'])
def get_leads():
    try:
        session_id = request.json['sessionId'] # type: ignore
        # print("get_leads session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_leads cookie_dict: ", cookie_dict)            
        api = Linkedin(cookies=cookie_dict) # type: ignore

        lead_list, member_urn_id_list, number_of_pages = SalesNavigatorLeadsInfo(api)
        dbCon.store_leads(lead_list)

        return jsonify(success=True, lead_list=lead_list, member_urn_id_list=member_urn_id_list,
                       number_of_pages = number_of_pages)
    except Exception as e:
        return jsonify(success=False, message=str(e))

# @app.route('/use-bingai', methods=['POST'])
# def use_bingai():
#     try:
#         prompt = request.json['prompt'] # type: ignore    
#         data = q.enqueue(UseBingAI, prompt)
#         job_id = data.get_id()

#         return jsonify(success=True, message=job_id)
#     except Exception as e:
#         return jsonify(success=False, message=str(e))

@app.route('/use-chatgpt', methods=['POST'])
def use_chatgpt():
    try:
        prompt = request.json['prompt'] # type: ignore   
        data = q.enqueue(UseChatGPT, prompt)
        job_id = data.get_id()
        return jsonify(success=True, message=job_id)
    
    except Exception as e:
        return jsonify(success=False, message=str(e))
    
@app.route('/job-status', methods=['POST'])
def job_status():
    try:
        job_id = request.json['jobId'] # type: ignore
        job = q.fetch_job(job_id)
        job_status = job.get_status() # type: ignore
        result = job.result # type: ignore
        if job.is_failed: # type: ignore
            return jsonify(success=False, status=job_status, message="An error has occurred", result=result)
        return jsonify(success=True, status=job_status, result=result)
    
    except Exception as e:
        return jsonify(success=False, message=str(e))

# Used when searching for leads in DB
@app.route('/get-people-interests', methods=['POST'])
def get_people_interests():

    try:    
        session_id = request.json['sessionId'] # type: ignore
        # print("get_people_interests session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_people_interests cookie_dict: ", cookie_dict)

        profile_urn = request.json['profileUrn'] # type: ignore
        
        data = q.enqueue(GetPeopleInterests, cookie_dict, profile_urn)
        
        job_id = data.get_id()
        
        return jsonify(success=True, message=job_id)
    
    except Exception as e:
        return jsonify(success=False, message=str(e))

# Used when searching for leads in DB
@app.route('/get-company-interests', methods=['POST'])
def get_company_interests():

    try:
        session_id = request.json['sessionId'] # type: ignore
        # print("get_company_interests session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_company_interests cookie_dict: ", cookie_dict)
        
        profile_urn = request.json['profileUrn'] # type: ignore

        data = q.enqueue(GetCompanyInterests, cookie_dict, profile_urn)
        
        job_id = data.get_id()
        
        return jsonify(success=True, message=job_id)

    except Exception as e:
        return jsonify(success=False, message=str(e))
     
@app.route('/get-convo-threads', methods=['POST'])
def get_convo_threads():

    try:
        session_id = request.json['sessionId'] # type: ignore
        # print("get_convo_threads session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_convo_threads cookie_dict: ", cookie_dict)

        api = Linkedin(cookies=cookie_dict) # type: ignore
        
        data = GetConversationThreads(api)
        # print("GetConversationThreads output: ", data)
        
        return jsonify(success=True, message=data)
    
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/get-convo-messages', methods=['POST'])
def get_convo_messages():

    try:    
        session_id = request.json['sessionId'] # type: ignore
        # print("get_convo_messages session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_convo_messages cookie_dict: ", cookie_dict)

        thread_id = request.json['threadId'] # type: ignore
        
        data = GetConversationMessages(cookie_dict, thread_id)
    
        return jsonify(success=True, message=data)
    
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/send-connect', methods=['POST'])
def send_connect():
    try:
        session_id = request.json['sessionId'] # type: ignore
        # print("get_convo_messages session_id: ", session_id)

        cookie_dict = dbCon.get_cookie_from_user_sessions(session_id)
        # print("get_convo_messages cookie_dict: ", cookie_dict)
        
        api = Linkedin(cookies=cookie_dict) # type: ignore

        profile_id = request.json['profileId'] # type: ignore

        my_tuple = tuple(profile_id.strip("()").split(","))

        actual_profile_urn, auth_type, auth_token = my_tuple 
        # profile_urn_for_lead_profile = "profileId:"+actual_profile_urn
        # auth_type_for_lead_profile = "authType:"+auth_type
        # auth_token_for_lead_profile = "authToken:"+auth_token 

        text = request.json['text'] # type: ignore
        
        error_boolean = api.add_connection(actual_profile_urn, text)
        print(error_boolean)
        return jsonify(success=True, message=error_boolean)
    
    except Exception as e:
        print(e)
        return jsonify(success=False, message=str(e))

@app.route('/send-message', methods=['POST'])
def send_message():
    try:
        cookie_dict = request.json['cookie'] # type: ignore
        api = Linkedin(cookies=cookie_dict) # type: ignore

        profile_id = request.json['profileId'] # type: ignore
        text = request.json['text'] # type: ignore
        data = api.send_message(message_body = text, recipients=[profile_id])

        return jsonify(success=True, message='sent message')
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.route('/save-cookie', methods=['POST'])
def save_cookie():
    try:
        cookies_list = request.json['cookie'] # type: ignore  
        cookie_dict = cookies_list_to_cookie_dict(cookies_list)

        api = Linkedin(cookies=cookie_dict) # type: ignore

        # Save the cookie_dict in DB and return a session_id for the user
        # The session_id will be passed back by the user, it will be checked against the DB
        # and will return the cookie_dict to be passed in the LinkedIn API.
        session_id = dbCon.store_cookie_return_sessionid(cookie_dict)

        # ============= Get my info =================================
        my_prof = api.get_user_profile()
        my_prof_mini_profile = my_prof['miniProfile'] # type: ignore
        my_prof_full_name = my_prof_mini_profile['firstName'] + " " + my_prof_mini_profile['lastName']
        my_prof_occupation = my_prof_mini_profile['occupation'] 
        dbCon.store_my_info(session_id, my_prof_full_name, my_prof_occupation)
        # ============= Get my info =================================

        return jsonify(success=True, message="success", session_id=session_id)
    except Exception as e:
        return jsonify(success=False, message=str(e))

@app.errorhandler(404)
def not_found(e):
    print("not found, error 404")
    return app.send_static_file("index.html")
# ================================================ ROUTES END =============================================

if __name__ == "__main__":
	app.run(host='0.0.0.0')