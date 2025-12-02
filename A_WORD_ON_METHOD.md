# Why and how i approached this project and what was my method

Hi there ! I'd like to talk to you about the way i constructed this project, the approach and choices i have made, and specifically when, how, and why i used AI to help me along. 

This project has been done in a three day span, from inception to deployement in the wild world ;) It is taken from a tech challenge that was proposed during a meetup at eXalt

## Project initialisation

As i never had to tackle microfrontend before, my first approach was to start exploring the patterns and approach required to do so in the Angular world. 

I started by reading some documentation around the subject, and once i had a veener of culture made, i reached for my favorite Pair Programmer / AI assistant (Github Copilot)

I then proceeded to do two things : 

- Set up a comprehensive "AGENTS.md" file to cosntrain and guide the AI along my journey
- Leveraged the AI integration of the angular cli for settings up basic context element angular based (and read them to start getting back my footing on it). 
- Asked my AI agent to generate a comprehensive plan for building a micro-frontend based application

Once i had this plan, i recouped it with the documentation, to make sure i understood it, and that the response the AI gave me was coherent.

After that i went on to bootstral the projects (following the plan).

First the host and remotes, then the following libraries : ui (component library), domain (domain logic)

## Bottom up and atomic design

I chose to follow an atomic design approach, in a bottom up fashion.

I started by implementing very simples atoms drawn from [Every Layout](https://every-layout.dev/) to implement a lean, css first, natively responsive approach, in the ui library.

I might have implemented more components that was strictly needed for the purpose of this project - i wanted to have some fun while i was shaking the rust on my angular skills ;) - so no regret there ;p

To build this my approach was to use storybook as a test bed, and implements each component in short iterations. 

I've not used AI much at this stage (besides autocompletes) but rather focused on finding and establishing the patterns that i would want to see in this application. 

After the first three components or so, i was able to start using AI to generate the following components, guiding it with a few-shots approach towards the desired solutions. 

Once the whole scope of the every layout atoms was done, i then continued with molecules, assembling the first functionnal building blocks of my application and their logic (search bar, paginated list, header...)

Once this first phase was done, i was able to move on to the work on the feature components themselves. 

## Building the features components : accelerating towards the end goal

I implemented each feature component (catalog, detail, compare). At this stage, i was getting a little more pressed by time, so i started to rely a little more on the AI to do the heavy lifting. 

I did so confidently, as i had setup enough in term of context / patterns, to be sure that the AI would be able to assemble properly the "lego bricks" into cohesive units. 

Since i had incepted from the start an hexagonal architecture (and the business being in that example quite simple), i was able to rather quickly assemble "my lego bricks" by guiding the AI and iterating with it, making sure at each step to do short, narrow-focus iteration to avoid the AI getting lost. 

I also used these steps to keep enriching the context whenever the AI was messing up (although i might have missed a thing or two ;p) to strenghten the guidelines.

I ended up very quickly (and rather quicker than i expected) to a working version with all the major components implemented, and the module federation working (at the dev server level at least ;p)

I then proceeded to generate basic homepage and 404 pages to finalize each application.

I also had the time to iterate on a few idea and designs, trying out ideas that i could discard (one example was trying to change the pagination component and use some "caroussel" like component instead... The UI and the UX was horrendous, so i discarded it quite quickly after testing it). 

## Deployment, adjustments and other refactors. 

Once the dust settled, and i was happy with the overral design, i iterated with the AI to 
- craft a CI and make it so the build and deployment to gitlab pages of the project worked 
- refactored / integrated a few things that i first overlooked (for example integrating the theming).

One approach i used extensively was to ask the AI for a plan, and iterating on those plan, to avoid launching the AI on too complex a task. 

In some cases i did not went through with them, because it would have been too much given the time constraints i had ; however i kept those plans inside the docs/features directory, as .md files, which will allow me to improve the project later 

An example of such a plan is [the integration of ngrx](./docs/features/integrate_ngrx_plan.md)), which i have iterated over quite a few time (start was to add a state library sitting between the ui and the domain, which i did not liked)

## Other patterns

For the documentation part, i used another pattern. I first asked for a plan that i commited. I then mirrored the repository to a personnal one, in order to leverage the Github copilot integration, and to be able to enact the documentation effort phase in parallel : i had copilot start a remote dev session per phase, and stepped into review mode - i let it work, and reviewed and iterated on PR that was managed by the agent. 

I could have iterated more to get a more polished documentation, i'm afraid some errors have slipped through, but i was, overral, rather satisfied with the resulting doc. And the parallelization of it made it so i could deliver it on time and budget, so that was an acceptable trade off for the exercise :)

# What i did not do and that i regret...

I am still a bit lacking in some areas, and one of this areas is testing on the frontend... I have not done enough test (as in automated test), but rather resorted to manual testing. I'm not happy with that, and my next step will be to fix that by ensuring all parts of this application is properly covered with test at the component level. I will probably do it as a prerequisite to the Ngrx migration that i have planned ;p

> That's all folks ! Thanks for reading, hope the review is enjoyable, and don't hesitate to play with the app ! ;)
