name := """VesselWebsite"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(	
	"org.reactivemongo" %% "play2-reactivemongo" % "0.10.5.0.akka23",
	"org.webjars" % "bootstrap" % "3.3.1",
	"org.webjars" % "bootstrapvalidator" % "0.5.3",
	"org.webjars" % "angularjs" % "1.3.8",
	"org.webjars" % "angular-ui-bootstrap" % "0.12.0",
	"org.webjars" % "smart-table" % "2.0.1"
)
