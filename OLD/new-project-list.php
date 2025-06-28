<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>janerikvoigt.de</title>
    <!--<link rel="stylesheet" href="mybulma/css/mystyles.css">-->
    <link rel="stylesheet" href="css/mystyles.css">
    <link rel="stylesheet" href="css/images.css">
    <!--<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">-->
    <!--<script src="https://unpkg.com/ionicons@5.1.2/dist/ionicons.js"></script>-->
    <!-- TODO replace favicon! dont use google font from their server!!!! -->
</head>
<body>
    <!-- BANNER -->
    <section class="hero is-primary">
        <div class="hero-body ">
            <p class="title">
            janerikvoigt.de
            </p>
            <p class="subtitle">
            Projects
            </p>
        </div>
    </section>
    <!-- banner ended, Title section starts -->
    <section class="section">
        <div class="container">
            <h1 class="title">
            A few Projects of mine
            </h1>
            <p class="subtitle">
            Have a look around! 2
            </p>
        </div>
        
    </section>
    <!-- title section ends, list of projects start -->

    <section class="section">
        <div class="container">
            <div class="block">
                <div class="content">
                    <p> gi </p>
                    <div class="tags are-medium">
                        <span class="tag">All</span>
                        <span class="tag">Medium</span>
                        <span class="tag">Size</span>
                    </div>

                    <!-- test -->
                    <?php

                        //phpinfo();

                        $servername = "mysql.webhosting34.1blu.de";
                        $database = "db321583x3220115";
                        $username = "s321583_3220115";
                        $password = "n2dK@4Em$H9s8p%vxb&j";
                        // Create connection
                        $conn = mysqli_connect($servername, $username, $password, $database);
                        // Check connection
                        if (!$conn) {
                            die("Connection failed: " . mysqli_connect_error());
                        }
                        echo "Connected successfully";
                        mysqli_close($conn);
                    ?>

                </div>
            </div>
        </div>
    </section>    
            <!--<div class="block">
                <div class="container">

                <div class="tags are-medium">
                    <span class="tag">All</span>
                    <span class="tag">Medium</span>
                    <span class="tag">Size</span>
                </div>

                <!-- test 
                <?php
                    $servername = "mysql.webhosting34.1blu.de";
                    $database = "db321583x3220115";
                    $username = "s321583_3220115";
                    $password = "n2dK@4Em$H9s8p%vxb&j";
                    // Create connection
                    $conn = mysqli_connect($servername, $username, $password, $database);
                    // Check connection
                    if (!$conn) {
                        die("Connection failed: " . mysqli_connect_error());
                    }
                    echo "Connected successfully";
                    mysqli_close($conn);
                ?>-->

            <!--</div>
        </div>-->


       <!-- todo add extension <div class="is-divider" data-content="OR"></div>-->

        <!--<div class="container">
            <div class="columns">
                <div class="column is-8 is-offset-2">
                    <!-- now all card of projects: -->


                    <!--<div class="block">

                        <div class="card">
                            <div class="columns is-desktop">
                                <!-- thumbnail -->
                                <!--<div class="column">
                                    <div class="card-image">
                                        <figure class="image is-4by3">
                                            <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
                                        </figure>
                                    </div>
                                </div>
                            
                                <!-- description -->
                                <!--<div class="column">
                                    <div class="card-content">
                                        <div class="content">
                                            <p class="title"> Name of Project</p>
                                            <p class="subtitle has-text-dark"> A brief description</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris. <a>@bulmaio</a>. <a href="#">#css</a> <a href="#">#responsive</a></p>

                                        
                                        </div>
                                        <div class="content has-text-centered">
                                            <a class="button is-primary">Read More!</a>
                                        </div>
                                        <!-- TODO put in content, aswell! 
                                        <p align="right"><time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time></p>-->
                                    <!--</div>
                                </div>
                            </div>
                        </div>


                    </div>

                    <!--
                    <div class="block">

                        <div class="card">
                            <div class="columns is-desktop">
                                <!-- thumbnail -->
                                <!--<div class="column">
                                
                                    <div class="card-image">
                                        <figure class="image is-4by3">
                                            <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
                                        </figure>
                                    </div>
                                </div>
                            
                                <!-- description -->
                                <!--<div class="column">
                                    <div class="card-content">
                                        <div class="content">
                                            <p class="title"> Name of Project</p>
                                            <p class="subtitle has-text-dark"> A brief description</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris. <a>@bulmaio</a>. <a href="#">#css</a> <a href="#">#responsive</a></p>

                                        
                                        </div>
                                        <div class="content has-text-centered">
                                            <a class="button is-primary">Read More!</a>
                                        </div>
                                        <!-- TODO put in content, aswell! 
                                        <p align="right"><time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time></p>-->
                                    <!--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>-->
    <!--</section>-->

</body>
</html>
