
<template>
        <h1>Welcome to the Home Page</h1>
        <section>
            <h2>About Photon Ranch</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur necessitatibus beatae voluptatum, quis incidunt provident ex nemo molestias maxime quasi ipsam. Vitae id quam autem qui, recusandae natus architecto. Magni.</p>
        </section>
        <div class="columns">
        <section>
            <div class="column">
                <h3>Learn Astronomy</h3>
                <p>Use Photon Ranch in Real Time or schedule observations</p>
            </div>
        </section>
        <section>
            <div class="column">
                <h3>Observing</h3>
                <p>Explore astronomy with our activities linked to observing</p>
            </div>
        </section>
        <section>
            <div class="column">
                <h3>Data Lab</h3>
                <p>Analyze your data using browser based tools</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
h1 {
    text-align: center;
}
section {
    margin: 1.25em;
    padding: 1.25em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}

h2 {
    margin-bottom: 0.625em;
}

p {
    line-height: 1.5;
}

.columns {
    display: flex;
    justify-content: space-between;
}

.column {
    flex: 1;
    margin: 0 0.625em;
    padding: 1em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
</style>

