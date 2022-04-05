import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FileUploadValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    file: schema.file({
        size: '1mb',
        extname: ['csv'],
    })
  })

  public messages = {
    'file.required': 'File not found.',
    'file.size': 'File size over 1mb can not be uploaded.',
    'file.extname': '111Extname of file should only be \'csv\''
  }
}
