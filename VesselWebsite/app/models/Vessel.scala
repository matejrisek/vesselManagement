package models

import play.api.libs.json.Json
import reactivemongo.bson.BSONObjectID
import play.modules.reactivemongo.json.BSONFormats._

case class Vessel(_id: Option[BSONObjectID],
                  name: String,
                  width: Double,
                  length: Double,
                  draft: Double,
                  lat: Double,
                  long: Double)

object JsonFormats {
  implicit val vesselFormat = Json.format[Vessel]
}
