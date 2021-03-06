
# coding: utf-8

# In[1]:


from sqlalchemy import create_engine, Table, ForeignKey, Column, Boolean, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.pool import StaticPool


# In[2]:


engine = create_engine('sqlite:///data/data.sqlite', connect_args={'check_same_thread':False}, poolclass=StaticPool)
Base = declarative_base()


# In[3]:


incident_categories = Table('incident_categories', Base.metadata,
    Column('incident_id', ForeignKey('incidents.id'), primary_key=True),
    Column('category_id', ForeignKey('categories.id'), primary_key=True))


# In[4]:


class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    state = Column(String(2))
    n_killed = Column(Integer)
    n_injured = Column(Integer)  
    
    categories = relationship('Category',
                            secondary=incident_categories,
                            back_populates='incidents')
    participants = relationship('Participant', back_populates='incident')


# In[5]:


class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))  
    
    incidents = relationship('Incident',
                            secondary=incident_categories,
                            back_populates='categories')


# In[6]:


class Participant(Base):
    __tablename__ = 'participants'
    
    id = Column(Integer, primary_key=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'))
    age = Column(Integer)
    is_male = Column(Boolean)
    is_killed = Column(Boolean)
    is_victim = Column(Boolean)
    
    incident = relationship('Incident', back_populates='participants')


# In[7]:


class Statistics(Base):
    __tablename__ = 'statistics'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    
    values = relationship('StatisticsValue', back_populates='statistics')


# In[8]:


class StatisticsValue(Base):
    __tablename__ = 'statistics_values'
    
    id = Column(Integer, primary_key=True)
    year = Column(Integer)
    state = Column(String(2))
    value = Column(Integer)
    statistics_id = Column(Integer, ForeignKey('statistics.id'))
    
    statistics = relationship('Statistics', back_populates='values')


# In[9]:


Base.metadata.create_all(engine)


# In[ ]:


#!jupyter nbconvert --to Script db_scheme

