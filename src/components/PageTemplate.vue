<template>
    <main class="flex flex-column justify-content-between">
        <div class="content overflow-y-auto mt-3 mx-3 pt-3 px-3">
            <slot name="content" />
        </div>

        <div class="nav-buttons p-fluid p-3">
            <slot name="buttons" />
        </div>
    </main>
</template>

<style>
main {
    height: 100dvh;
}

.nav-buttons {
    background-color: seashell!important;
}

.nav-buttons > .p-button:last-child {
    margin-bottom: 0!important;
}

@media screen and (max-width: 767px) {
    main {
        width: 100%;
    }
}

@media screen and (min-width: 768px) {
    main {
        width: 600px;
    }
}
</style>
