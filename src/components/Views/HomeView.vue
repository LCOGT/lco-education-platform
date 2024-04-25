<template>
    <div class="columns">
    <section>
        <div class="column">
            <p>Remote control a telescope</p>
        </div>
    </section>
<section>
    <div class="column">
    <p>Schedule an observation</p>
</div>
</section>
</div>
</template>

<style scoped>
section {
    margin: 1.25em;
    padding: 1.25em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
    height: 15vh;
}
.columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 20%));
    gap: 10em;
    grid-auto-rows: minmax(0, 1fr);
    justify-content: center;
}
.column {
    margin: 0 0.625em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
@media (max-width: 1200px) {
    .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 40%));
    gap: 6em;
    grid-auto-rows: minmax(0, 1fr);
    justify-content: center;
}
.column {
    margin: 0 0.625em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
}
@media (max-width: 900px) {
    .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 45%));
    gap: 2em;
    grid-auto-rows: minmax(0, 1fr);
    justify-content: center;
}
.column {
    margin: 0 0.625em;
    background-color: #f0f0f0;
    border-radius: 0.3125em;
}
}
</style>
